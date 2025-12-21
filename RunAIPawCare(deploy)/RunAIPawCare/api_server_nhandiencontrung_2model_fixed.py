from __future__ import annotations

from flask import Flask, request, jsonify
from flask_cors import CORS

import io
import json
import os
from typing import List, Tuple, Optional, Dict, Any

import torch
import torch.nn as nn
from PIL import Image, ImageFile
from torchvision import transforms

ImageFile.LOAD_TRUNCATED_IMAGES = True

app = Flask(__name__)
CORS(app)
app.config["JSON_AS_ASCII"] = False

# =========================
# Paths (cùng thư mục với file này)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RESNET_CKPT_PATH = os.path.join(BASE_DIR, "NhanDienConTrung_best.pth")
EFFNET_CKPT_PATH = os.path.join(BASE_DIR, "EfficientNetB3_best.pth")
LABELS_PATH = os.path.join(BASE_DIR, "labels.json")
NORM_PATH = os.path.join(BASE_DIR, "norm.json")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Globals
classes: Optional[List[str]] = None
mean: Optional[List[float]] = None
std: Optional[List[float]] = None

model_resnet: Optional[nn.Module] = None
model_effb3: Optional[nn.Module] = None

tfm_resnet = None
tfm_effb3 = None

img_size_resnet: Optional[int] = None
img_size_effb3: Optional[int] = None


# =========================
# ResNet18 (đúng kiến trúc theo inference.py / api_server_nhandiencontrung.py)
# =========================
def conv3x3(in_channels: int, out_channels: int, stride: int = 1) -> nn.Conv2d:
    return nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)

def conv1x1(in_channels: int, out_channels: int, stride: int = 1) -> nn.Conv2d:
    return nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, padding=0, bias=False)

class BasicBlock(nn.Module):
    expansion = 1
    def __init__(self, inplanes: int, planes: int, stride: int = 1, downsample: Optional[nn.Module] = None):
        super().__init__()
        self.conv1 = conv3x3(inplanes, planes, stride=stride)
        self.bn1 = nn.BatchNorm2d(planes)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = conv3x3(planes, planes, stride=1)
        self.bn2 = nn.BatchNorm2d(planes)
        self.downsample = downsample
        self.stride = stride

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        if self.downsample is not None:
            identity = self.downsample(x)

        out = out + identity
        out = self.relu(out)
        return out

class ResNet(nn.Module):
    def __init__(self, block: type[BasicBlock], layers: List[int], num_classes: int):
        super().__init__()
        self.inplanes = 64
        self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.relu = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)

        self.layer1 = self._make_layer(block, 64, layers[0], stride=1)
        self.layer2 = self._make_layer(block, 128, layers[1], stride=2)
        self.layer3 = self._make_layer(block, 256, layers[2], stride=2)
        self.layer4 = self._make_layer(block, 512, layers[3], stride=2)

        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(512 * block.expansion, num_classes)

        self.apply(self._init_weights)

    def _make_layer(self, block: type[BasicBlock], planes: int, blocks: int, stride: int = 1) -> nn.Sequential:
        downsample = None
        if stride != 1 or self.inplanes != planes * block.expansion:
            downsample = nn.Sequential(
                conv1x1(self.inplanes, planes * block.expansion, stride=stride),
                nn.BatchNorm2d(planes * block.expansion),
            )

        layers: List[nn.Module] = [block(self.inplanes, planes, stride=stride, downsample=downsample)]
        self.inplanes = planes * block.expansion
        for _ in range(1, blocks):
            layers.append(block(self.inplanes, planes, stride=1, downsample=None))

        return nn.Sequential(*layers)

    @staticmethod
    def _init_weights(m: nn.Module) -> None:
        if isinstance(m, nn.Conv2d):
            nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
        elif isinstance(m, nn.BatchNorm2d):
            nn.init.ones_(m.weight)
            nn.init.zeros_(m.bias)
        elif isinstance(m, nn.Linear):
            nn.init.xavier_uniform_(m.weight)
            nn.init.zeros_(m.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.fc(x)
        return x

def resnet18(num_classes: int) -> ResNet:
    return ResNet(BasicBlock, [2, 2, 2, 2], num_classes)


# =========================
# EfficientNetB3 (FIX: head phải khớp checkpoint)
#   Checkpoint của bạn có keys:
#     head.0.0.weight, head.0.1.*, head.4.weight/bias
#   => head là nn.Sequential(
#        ConvBNAct(...), AdaptiveAvgPool2d(1), Flatten, Dropout, Linear
#      )
# =========================
class ConvBNAct(nn.Sequential):
    def __init__(
        self,
        in_c: int,
        out_c: int,
        kernel: int = 3,
        stride: int = 1,
        groups: int = 1,
        act: bool = True,
    ):
        padding = (kernel - 1) // 2
        layers: List[nn.Module] = [
            nn.Conv2d(in_c, out_c, kernel, stride, padding, groups=groups, bias=False),
            nn.BatchNorm2d(out_c),
        ]
        if act:
            layers.append(nn.SiLU(inplace=True))
        super().__init__(*layers)

class SqueezeExcite(nn.Module):
    def __init__(self, in_c: int, se_ratio: float = 0.25):
        super().__init__()
        hidden = max(1, int(in_c * se_ratio))
        self.se = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(in_c, hidden, 1),
            nn.SiLU(inplace=True),
            nn.Conv2d(hidden, in_c, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x * self.se(x)

class MBConv(nn.Module):
    def __init__(self, in_c: int, out_c: int, exp_ratio: int, se_ratio: float, stride: int, drop: float = 0.0):
        super().__init__()
        self.use_residual = (stride == 1 and in_c == out_c)
        self.drop = float(drop)

        hidden = int(in_c * exp_ratio)

        layers: List[nn.Module] = []

        # Expand (optional)
        if exp_ratio != 1:
            layers.append(ConvBNAct(in_c, hidden, kernel=1, stride=1, groups=1, act=True))
        else:
            hidden = in_c

        # Depthwise
        layers.append(ConvBNAct(hidden, hidden, kernel=3, stride=stride, groups=hidden, act=True))

        # SE
        layers.append(SqueezeExcite(hidden, se_ratio=se_ratio))

        # Project
        layers.append(nn.Sequential(
            nn.Conv2d(hidden, out_c, 1, bias=False),
            nn.BatchNorm2d(out_c),
        ))

        self.block = nn.Sequential(*layers)

    def _drop_connect(self, x: torch.Tensor) -> torch.Tensor:
        if (not self.training) or self.drop <= 0.0:
            return x
        keep = 1.0 - self.drop
        rand = keep + torch.rand((x.size(0), 1, 1, 1), device=x.device, dtype=x.dtype)
        mask = torch.floor(rand)
        return x / keep * mask

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.block(x)
        if self.use_residual:
            out = self._drop_connect(out)
            out = out + x
        return out

# (exp_ratio, in_c, out_c, repeats, stride, se_ratio)
B3_CFG: List[Tuple[int, int, int, int, int, float]] = [
    (1, 32, 16, 1, 1, 0.25),
    (6, 16, 24, 2, 2, 0.25),
    (6, 24, 40, 2, 2, 0.25),
    (6, 40, 80, 3, 2, 0.25),
    (6, 80, 112, 3, 1, 0.25),
    (6, 112, 192, 4, 2, 0.25),
    (6, 192, 320, 1, 1, 0.25),
]

class EfficientNetB3(nn.Module):
    def __init__(self, num_classes: int, drop_rate: float = 0.5, drop_connect_rate: float = 0.2, head_channels: int = 1280):
        super().__init__()
        self.stem = ConvBNAct(3, 32, kernel=3, stride=2, groups=1, act=True)

        blocks: List[nn.Module] = []
        total_blocks = sum(r for (_, _, _, r, _, _) in B3_CFG)
        b = 0

        for exp_ratio, in_c, out_c, repeats, stride, se_ratio in B3_CFG:
            for i in range(repeats):
                s = stride if i == 0 else 1
                cur_in = in_c if i == 0 else out_c
                drop = drop_connect_rate * float(b) / float(max(1, total_blocks - 1))
                blocks.append(MBConv(cur_in, out_c, exp_ratio, se_ratio, s, drop=drop))
                b += 1

        self.blocks = nn.Sequential(*blocks)

        # FIX: head là Sequential để khớp checkpoint (head.0.* và head.4.*)
        self.head = nn.Sequential(
            ConvBNAct(320, head_channels, kernel=1, stride=1, groups=1, act=True),
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(1),
            nn.Dropout(p=drop_rate),
            nn.Linear(head_channels, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.stem(x)
        x = self.blocks(x)
        x = self.head(x)
        return x


# =========================
# Shared helpers
# =========================
def make_transform(img_size: int, mean_: List[float], std_: List[float]) -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean_, std_),
    ])

def load_labels_and_norm() -> Tuple[List[str], List[float], List[float]]:
    if not os.path.exists(LABELS_PATH):
        raise FileNotFoundError(f"Không tìm thấy labels.json: {LABELS_PATH}")
    if not os.path.exists(NORM_PATH):
        raise FileNotFoundError(f"Không tìm thấy norm.json: {NORM_PATH}")

    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        classes_ = json.load(f).get("classes")
    if not classes_:
        raise ValueError("labels.json không có field 'classes'")

    with open(NORM_PATH, "r", encoding="utf-8") as f:
        d = json.load(f)
        mean_ = d.get("mean")
        std_ = d.get("std")
    if mean_ is None or std_ is None:
        raise ValueError("norm.json không có field 'mean/std'")

    classes_ = list(classes_)
    mean_ = [float(x) for x in mean_]
    std_ = [float(x) for x in std_]
    return classes_, mean_, std_

def _strip_module_prefix(state: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
    # nếu train bằng DataParallel -> keys có thể bắt đầu bằng "module."
    if not state:
        return state
    if all(k.startswith("module.") for k in state.keys()):
        return {k[len("module."):]: v for k, v in state.items()}
    return state

def _state_from_ckpt(ckpt: Dict[str, Any]) -> Dict[str, torch.Tensor]:
    state = ckpt.get("model_state")
    if isinstance(state, dict):
        return _strip_module_prefix(state)
    if all(isinstance(v, torch.Tensor) for v in ckpt.values()):
        return _strip_module_prefix(ckpt)  # type: ignore
    raise ValueError("Checkpoint không đúng định dạng (thiếu model_state/state_dict)")

def _infer_effnet_head_channels_and_classes(state: Dict[str, torch.Tensor], fallback_num_classes: int) -> Tuple[int, int]:
    """
    Với checkpoint của bạn:
      - head.0.0.weight: [head_channels, 320, 1, 1]
      - head.4.weight:   [num_classes, head_channels]
    """
    head_channels = 1280
    num_classes = fallback_num_classes

    if "head.0.0.weight" in state:
        head_channels = int(state["head.0.0.weight"].shape[0])
    if "head.4.weight" in state:
        num_classes = int(state["head.4.weight"].shape[0])

    return head_channels, num_classes

def initialize_models() -> None:
    global classes, mean, std
    global model_resnet, model_effb3, tfm_resnet, tfm_effb3
    global img_size_resnet, img_size_effb3

    classes, mean, std = load_labels_and_norm()

    if not os.path.exists(RESNET_CKPT_PATH):
        raise FileNotFoundError(f"Không tìm thấy checkpoint ResNet: {RESNET_CKPT_PATH}")
    if not os.path.exists(EFFNET_CKPT_PATH):
        raise FileNotFoundError(f"Không tìm thấy checkpoint EfficientNetB3: {EFFNET_CKPT_PATH}")

    # ===== ResNet =====
    ckpt_r = torch.load(RESNET_CKPT_PATH, map_location="cpu")  # chỉ load file bạn tin tưởng
    state_r = _state_from_ckpt(ckpt_r)
    img_size_resnet = int(ckpt_r.get("img_size", 224))

    model_resnet = resnet18(num_classes=len(classes)).to(device)
    model_resnet.load_state_dict(state_r, strict=True)
    model_resnet.eval()
    tfm_resnet = make_transform(img_size_resnet, mean, std)

    # ===== EfficientNetB3 =====
    ckpt_e = torch.load(EFFNET_CKPT_PATH, map_location="cpu")  # chỉ load file bạn tin tưởng
    state_e = _state_from_ckpt(ckpt_e)
    img_size_effb3 = int(ckpt_e.get("img_size", 300))

    head_channels, num_classes_eff = _infer_effnet_head_channels_and_classes(state_e, fallback_num_classes=len(classes))
    if num_classes_eff != len(classes):
        raise RuntimeError(
            f"Số lớp trong EfficientNetB3 checkpoint ({num_classes_eff}) khác labels.json ({len(classes)}). "
            "Hãy kiểm tra labels.json có đúng với model không."
        )

    model_effb3 = EfficientNetB3(num_classes=num_classes_eff, head_channels=head_channels).to(device)
    model_effb3.load_state_dict(state_e, strict=True)
    model_effb3.eval()
    tfm_effb3 = make_transform(img_size_effb3, mean, std)

    print("✅ Loaded 2 models successfully")
    print(f"- Device: {device}")
    print(f"- Classes({len(classes)}): {classes}")
    print(f"- ResNet18   : {RESNET_CKPT_PATH} | img_size={img_size_resnet}")
    print(f"- EfficientB3: {EFFNET_CKPT_PATH} | img_size={img_size_effb3} | head_channels={head_channels}")
    print(f"- labels.json: {LABELS_PATH}")
    print(f"- norm.json  : {NORM_PATH}")

@torch.inference_mode()
def predict_with(model: nn.Module, tfm: transforms.Compose, pil_image: Image.Image, topk: int = 1) -> List[Dict[str, Any]]:
    x = tfm(pil_image).unsqueeze(0).to(device)
    logits = model(x)
    probs = torch.softmax(logits, dim=1)[0]

    k = max(1, min(int(topk), probs.numel()))
    confs, idxs = torch.topk(probs, k=k)

    out: List[Dict[str, Any]] = []
    for c, i in zip(confs.tolist(), idxs.tolist()):
        out.append({
            "label": classes[int(i)],  # type: ignore[index]
            "confidence": round(float(c) * 100.0, 2),
            "class_index": int(i),
        })
    return out

def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    try:
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Không thể đọc ảnh: {str(e)}")


# =========================
# API
# =========================
@app.route("/api/classify-image", methods=["POST"])
def classify_image():
    try:
        if model_resnet is None or model_effb3 is None or classes is None:
            return jsonify({"error": "Model chưa được load"}), 500
        if "image" not in request.files:
            return jsonify({"error": 'Không có file ảnh (field name phải là "image")'}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Không có file được chọn"}), 400

        topk = request.args.get("topk") or request.form.get("topk") or 1
        try:
            topk = int(topk)
        except Exception:
            topk = 1

        pil_image = load_image_from_bytes(file.read())

        res_r = predict_with(model_resnet, tfm_resnet, pil_image, topk=topk)  # type: ignore[arg-type]
        res_e = predict_with(model_effb3, tfm_effb3, pil_image, topk=topk)    # type: ignore[arg-type]

        if topk <= 1:
            return jsonify({
                "resnet18": {
                    "prediction": res_r[0]["label"],
                    "confidence": res_r[0]["confidence"],
                    "class_index": res_r[0]["class_index"],
                },
                "efficientnetb3": {
                    "prediction": res_e[0]["label"],
                    "confidence": res_e[0]["confidence"],
                    "class_index": res_e[0]["class_index"],
                }
            })

        return jsonify({
            "topk": int(topk),
            "resnet18": {"predictions": res_r},
            "efficientnetb3": {"predictions": res_e},
        })

    except Exception as e:
        return jsonify({"error": f"Lỗi xử lý ảnh: {str(e)}"}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "device": str(device),
        "labels_path": LABELS_PATH,
        "norm_path": NORM_PATH,
        "resnet18": {
            "loaded": model_resnet is not None,
            "ckpt_path": RESNET_CKPT_PATH,
            "img_size": img_size_resnet,
        },
        "efficientnetb3": {
            "loaded": model_effb3 is not None,
            "ckpt_path": EFFNET_CKPT_PATH,
            "img_size": img_size_effb3,
        },
        "classes_count": len(classes) if classes else 0,
    })


if __name__ == "__main__":
    print("Initializing 2 models...")
    initialize_models()
    print("Starting Flask server on port 5000...")
    app.run(debug=True, host="0.0.0.0", port=5000)
