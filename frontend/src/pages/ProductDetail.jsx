<<<<<<< HEAD
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
=======
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Typography,
  Breadcrumbs,
<<<<<<< HEAD
  Link as MUILink,
=======
  Link,
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
  Chip,
  Rating,
  Button,
  Paper,
  Divider,
  ImageList,
  ImageListItem,
  TextField,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
<<<<<<< HEAD
  ListItemButton,
  ListItemText,
  Stack,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { getProductDetail } from '../api/http';
import http from '../api/http';
=======
  ListItem,
  ListItemText
} from '@mui/material';
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();
=======
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [addingToCart, setAddingToCart] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionAuthDialogOpen, setQuestionAuthDialogOpen] = useState(false);

  const sectionList = [
    { key: 'desc', label: 'Mô tả sản phẩm' },
    { key: 'ingredients', label: 'Thành phần' },
    { key: 'benefit', label: 'Công dụng' },
    { key: 'usage', label: 'Cách dùng' },
    { key: 'sideEffect', label: 'Tác dụng phụ' },
    { key: 'note', label: 'Lưu ý' },
    { key: 'preserve', label: 'Bảo quản' },
    { key: 'questions', label: 'Câu hỏi' },
  ];
  const [activeSection, setActiveSection] = useState('desc');
  const sectionsRef = useRef({});
=======
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) throw new Error('missing id');
        setLoading(true);
        setError('');
<<<<<<< HEAD
        const response = await getProductDetail(id);
        const data = response?.data || response || null;
        if (mounted) setProduct(data);
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin sản phẩm');
        }
=======
        const res = await fetch(`http://127.0.0.1:8080/api/v1/products/detail/${id}`);
        const json = await res.json();
        const data = json?.data || null;
        if (mounted) setProduct(data);
      } catch {
        if (mounted) setError('Không thể tải thông tin sản phẩm');
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=900&fit=crop'];
    const list = [];
    if (product.imageUrl) list.push(product.imageUrl);
    if (Array.isArray(product.images)) list.push(...product.images.filter(Boolean));
    return list.length ? list : ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=900&fit=crop'];
  }, [product]);

<<<<<<< HEAD
  const formatCurrency = useCallback(
    (price) =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: product?.currency || 'VND',
      }).format(Number(price || 0)),
    [product?.currency]
  );

  const inStock = (product?.quantity ?? 0) > 0;
  const rx =
    product?.precription !== undefined
      ? product?.precription
      : product?.prescription !== undefined
      ? product?.prescription
      : null;

  const handleScrollTo = (key) => {
    const el = sectionsRef.current[key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const requireAuth = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthDialogOpen(true);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product || !id || !inStock) return;
    if (!requireAuth()) return;
    try {
      setAddingToCart(true);
      const response = await http.post('/carts/items', { productId: id, quantity: qty });
      const data = response?.data?.data || response?.data || response;
      if (data) {
        setSnackbar({ open: true, message: 'Đã thêm sản phẩm vào giỏ hàng!', severity: 'success' });
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !id || !inStock) return;
    if (!requireAuth()) return;
    try {
      setAddingToCart(true);
      const response = await http.post('/carts/items', { productId: id, quantity: qty });
      const data = response?.data?.data || response?.data || response;
      if (data) navigate('/cart');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể thực hiện mua ngay. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      setSnackbar({ open: true, message: 'Vui lòng nhập câu hỏi', severity: 'warning' });
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setQuestionAuthDialogOpen(true);
      return;
    }

    try {
      setSubmittingQuestion(true);
      const response = await http.post(`/products/${id}/questions`, {
        question: questionText.trim(),
      });

      const data = response?.data?.data || response?.data || response;
      if (data) {
        // Add new question to the list
        const newQuestion = {
          questionId: data.questionId || Date.now().toString(),
          question: questionText.trim(),
          createdDate: data.createdDate || new Date().toISOString(),
          likesCount: data.likesCount || 0,
          userName: data.userName || null,
          avatarUrl: data.avatarUrl || null,
          answers: data.answers || [],
        };

        setProduct((prev) => ({
          ...prev,
          questions: Array.isArray(prev?.questions) ? [newQuestion, ...prev.questions] : [newQuestion],
        }));

        setQuestionText('');
        setSnackbar({ open: true, message: 'Đã đặt câu hỏi thành công!', severity: 'success' });
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể đặt câu hỏi. Vui lòng thử lại.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  useEffect(() => {
    if (!product) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    sectionList.forEach((s) => {
      const el = sectionsRef.current[s.key];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [product]);
=======
  const formatCurrency = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: product?.currency || 'VND' })
      .format(Number(price || 0));

  const inStock = (product?.quantity ?? 0) > 0;
  const rx = product?.precription ?? product?.prescription ?? null;
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '60vh' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/')}>Về trang chủ</Button>
        </Container>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '60vh' }}>
        <Container maxWidth="lg">
          <Alert severity="warning">Không tìm thấy sản phẩm</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', py: 4, minHeight: '100vh' }}>
      <Container maxWidth="lg">
<<<<<<< HEAD
        <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
          <MUILink underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Trang chủ</MUILink>
          <MUILink underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/category/' + (product?.category || ''))}>{product?.category || 'Danh mục'}</MUILink>
          <Typography color="text.primary">{product?.name || 'Chi tiết sản phẩm'}</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, mb: 4, bgcolor: 'background.paper', boxShadow: '0 12px 28px rgba(0,0,0,0.06)', backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Box>
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, bgcolor: 'grey.100' }}>
                  <motion.img
                    key={images[activeImg]}
                    src={images[activeImg]}
                    alt={product?.name}
                    style={{ width: '100%', height: 440, objectFit: 'cover', display: 'block' }}
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  />
                </Box>
                {images.length > 1 && (
                  <ImageList cols={4} gap={10} sx={{ m: 0 }}>
                    {images.slice(0, 8).map((src, i) => (
                      <ImageListItem key={i} onClick={() => setActiveImg(i)} style={{ cursor: 'pointer' }}>
                        <img
                          src={src}
                          alt={`thumb-${i}`}
                          loading="lazy"
                          style={{
                            height: 84,
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: 10,
                            outline: i === activeImg ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.08)',
                            filter: i === activeImg ? 'none' : 'saturate(0.9)'
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {product?.manufacturer && (
                  <Chip size="small" color="primary" variant="outlined" label={product.manufacturer} sx={{ fontWeight: 500 }} />
                )}
                <Chip size="small" color="success" variant="outlined" label="Chính hãng" sx={{ fontWeight: 500 }} />
              </Stack>

              <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 800, lineHeight: 1.25, mb: 1 }}>
                {product?.name}
              </Typography>

              <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1.5} sx={{ mb: 2 }}>
                <Rating value={Number(product?.ratingAvg) || 0} readOnly precision={0.1} size="small" />
                <Typography variant="body2" color="text.secondary">
                  {product?.ratingAvg ? `${product.ratingAvg} đánh giá` : 'Chưa có đánh giá'}
                </Typography>
                {rx !== null && (
                  <Chip size="small" label={rx ? 'Thuốc kê đơn (Rx)' : 'Không kê đơn (OTC)'} color={rx ? 'warning' : 'success'} sx={{ fontWeight: 500 }} />
                )}
                <Chip size="small" label={inStock ? 'Còn hàng' : 'Hết hàng'} color={inStock ? 'success' : 'default'} sx={{ fontWeight: 500 }} />
                {product?.soldQuantity > 0 && <Chip size="small" variant="outlined" label={`Đã bán ${product.soldQuantity}`} />}
              </Stack>

              <Stack direction="row" alignItems="flex-end" flexWrap="wrap" spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
                  {formatCurrency(product?.originPrice)}
                </Typography>
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {product?.description ? product.description : 'Sản phẩm chăm sóc sức khỏe chất lượng cao từ MedStore.'}
              </Typography>

              <Grid container spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
                <Grid item>
                  <TextField
                    type="number"
                    size="small"
                    label="Số lượng"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                    inputProps={{ min: 1, style: { width: 100 } }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!inStock || addingToCart}
                    onClick={handleAddToCart}
                    startIcon={addingToCart ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 6px 16px rgba(33,203,243,.35)',
                      '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)', boxShadow: '0 10px 20px rgba(33,203,243,.45)' },
                      '&:disabled': { background: 'rgba(0, 0, 0, 0.12)', boxShadow: 'none' },
                    }}
                  >
                    {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="large"
                    disabled={!inStock || addingToCart}
                    onClick={handleBuyNow}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
                  >
                    Mua ngay
                  </Button>
                </Grid>
              </Grid>

              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Thông tin sản phẩm</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Tên sản phẩm</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.name || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Danh mục</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.category || 'Khác'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Thương hiệu / Nhà sản xuất</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.manufacturer || 'Đang cập nhật'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Ngày sản phẩm</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.productDate || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Kê đơn</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{rx === null ? '—' : rx ? 'Thuốc kê đơn (Rx)' : 'Không kê đơn (OTC)'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Tồn kho</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.quantity ?? '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Đã bán</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.soldQuantity ?? 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Tiền tệ</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{product?.currency || 'VND'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper variant="outlined" sx={{ borderRadius: 2, position: 'sticky', top: 80, p: 0, overflow: 'hidden' }}>
              <List disablePadding>
                {sectionList.map((sec) => (
                  <ListItemButton
                    key={sec.key}
                    onClick={() => handleScrollTo(sec.key)}
                    selected={activeSection === sec.key}
                    sx={{
                      alignItems: 'flex-start',
                      py: 1.5,
                      px: 2,
                      borderLeft: '4px solid',
                      borderColor: activeSection === sec.key ? 'primary.main' : 'transparent',
                      '&.Mui-selected': { bgcolor: 'action.hover' },
                      '&:not(:last-of-type)': { borderBottom: '1px solid', borderBottomColor: 'divider' },
                    }}
                  >
                    <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: activeSection === sec.key ? 800 : 500, lineHeight: 1.4 }}>{sec.label}</Typography>} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <SectionCard title="Mô tả sản phẩm" refEl={(el) => (sectionsRef.current['desc'] = el)} sectionId="desc">
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.description || 'Đang cập nhật nội dung mô tả sản phẩm.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Thành phần" refEl={(el) => (sectionsRef.current['ingredients'] = el)} sectionId="ingredients">
              {Array.isArray(product?.ingredients) && product.ingredients.length > 0 ? (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100', '& th': { fontWeight: 700, whiteSpace: 'nowrap' } }}>
                      <TableRow>
                        <TableCell>Thông tin thành phần</TableCell>
                        <TableCell>Hàm lượng</TableCell>
                        <TableCell>Đơn vị</TableCell>
                        <TableCell>Mô tả</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.ingredients.map((ing, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700 }}>{ing?.name || '—'}</TableCell>
                          <TableCell>{ing?.amount ?? '—'}</TableCell>
                          <TableCell>{ing?.unit || '—'}</TableCell>
                          <TableCell sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ing?.description || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ) : (
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Đang cập nhật thành phần.</Typography>
              )}
            </SectionCard>

            <SectionCard title="Công dụng" refEl={(el) => (sectionsRef.current['benefit'] = el)} sectionId="benefit">
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.benefit || 'Đang cập nhật công dụng sản phẩm.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Cách dùng" refEl={(el) => (sectionsRef.current['usage'] = el)} sectionId="usage">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Cách dùng</Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 2 }}>
                {product?.usage || 'Đang cập nhật hướng dẫn sử dụng.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Tác dụng phụ" refEl={(el) => (sectionsRef.current['sideEffect'] = el)} sectionId="sideEffect">
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.sideEffect || 'Chưa có thông tin về tác dụng phụ của sản phẩm.'}
              </Typography>
            </SectionCard>

            <SectionCard refEl={(el) => (sectionsRef.current['note'] = el)} sectionId="note">
              <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: 'warning.50', borderColor: 'warning.light', p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.dark', mb: 1 }}>Lưu ý</Typography>
                {product?.note && (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 2 }}>
                    {product.note}
                  </Typography>
                )}
              </Paper>
            </SectionCard>

            <SectionCard title="Bảo quản" refEl={(el) => (sectionsRef.current['preserve'] = el)} sectionId="preserve" noDividerAtEnd>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product?.preserve || 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp từ mặt trời.'}
              </Typography>
            </SectionCard>

            <SectionCard title="Câu hỏi thường gặp" refEl={(el) => (sectionsRef.current['questions'] = el)} sectionId="questions" noDividerAtEnd>
              {/* Question Input Form */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                  bgcolor: 'grey.50',
                  border: '2px solid',
                  borderColor: 'primary.light',
                  backgroundImage: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  Đặt câu hỏi về sản phẩm
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Nhập câu hỏi của bạn về sản phẩm này..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                  }}
                  disabled={submittingQuestion}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setQuestionText('')}
                    disabled={submittingQuestion || !questionText.trim()}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmitQuestion}
                    disabled={submittingQuestion || !questionText.trim()}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 4,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 6px 16px rgba(33,203,243,.35)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                        boxShadow: '0 10px 20px rgba(33,203,243,.45)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {submittingQuestion ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                        Đang gửi...
                      </>
                    ) : (
                      'Đặt câu hỏi'
                    )}
                  </Button>
                </Box>
              </Paper>

              {/* Questions List */}
              {Array.isArray(product?.questions) && product.questions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {product.questions.map((q, i) => {
                    const questionText = typeof q === 'string' ? q : q?.question || '';
                    const questionId = q?.questionId || i;
                    const createdDate = q?.createdDate || '';
                    const likesCount = q?.likesCount || 0;
                    const userName = q?.userName || 'Người dùng';
                    const avatarUrl = q?.avatarUrl || null;
                    const answers = Array.isArray(q?.answers) ? q.answers : [];
                    return (
                      <Card key={questionId} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', '&:hover': { boxShadow: 2, transition: 'all 0.2s ease-in-out' } }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                            <Avatar src={avatarUrl} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                              {!avatarUrl && <PersonIcon />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{userName}</Typography>
                                {createdDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    • {new Date(createdDate).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary', mb: 1.5 }}>{questionText}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                  <ThumbUpIcon fontSize="small" />
                                  <Typography variant="caption" sx={{ ml: 0.5 }}>{likesCount > 0 ? likesCount : ''}</Typography>
                                </IconButton>
                                {answers.length > 0 && (
                                  <Chip icon={<QuestionAnswerIcon />} label={`${answers.length} trả lời`} size="small" variant="outlined" sx={{ height: 24 }} />
                                )}
                              </Box>
                            </Box>
                          </Box>
                          {answers.length > 0 && (
                            <Box sx={{ ml: 6, mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                              {answers.map((answer, ansIdx) => (
                                <Box key={ansIdx} sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                                      <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{answer.userName || 'Quản trị viên'}</Typography>
                                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                        {typeof answer === 'string' ? answer : answer.content || answer.answer || ''}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                  }}
                >
                  <QuestionAnswerIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi về sản phẩm này!
                  </Typography>
                </Paper>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ '& .MuiSnackbarContent-root': { borderRadius: 2 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', '& .MuiAlert-icon': { fontSize: 24 } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent dividers>
          <Typography>Vui lòng đăng nhập trước khi mua hoặc thêm sản phẩm vào giỏ hàng.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialogOpen(false)}>Để sau</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAuthDialogOpen(false);
              const redirect = encodeURIComponent(location.pathname + location.search);
              navigate(`/login?redirect=${redirect}`);
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Auth Dialog */}
      <Dialog
        open={questionAuthDialogOpen}
        onClose={() => setQuestionAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'primary.main' }}>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Vui lòng đăng nhập trước khi đặt câu hỏi về sản phẩm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionAuthDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Để sau
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setQuestionAuthDialogOpen(false);
              const redirect = encodeURIComponent(location.pathname + location.search);
              navigate(`/login?redirect=${redirect}`);
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              },
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SectionCard({ title, children, refEl, sectionId, noDividerAtEnd }) {
  return (
    <Paper
      variant="outlined"
      ref={refEl}
      id={sectionId}
      sx={{ borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3, scrollMarginTop: '80px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}
    >
      {title && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 2 }}>{title}</Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      {children}
      {!noDividerAtEnd && <Divider sx={{ mt: 3, opacity: 0.4 }} />}
    </Paper>
  );
}
=======
        <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Trang chủ
          </Link>
          <Typography color="text.primary">Chi tiết sản phẩm</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                <motion.img
                  key={images[activeImg]}
                  src={images[activeImg]}
                  alt={product?.name}
                  style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                />
              </Box>
              {images.length > 1 && (
                <ImageList cols={4} gap={10} sx={{ m: 0 }}>
                  {images.slice(0, 8).map((src, i) => (
                    <ImageListItem key={i} onClick={() => setActiveImg(i)} style={{ cursor: 'pointer' }}>
                      <img
                        src={src}
                        alt={`thumb-${i}`}
                        loading="lazy"
                        style={{
                          height: 80,
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: 10,
                          outline: i === activeImg ? '2px solid #1976d2' : 'none'
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold', mb: 1 }}>
              {product?.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating value={Number(product?.ratingAvg) || 0} readOnly precision={0.1} size="small" />
              <Typography variant="body2" color="text.secondary">({product?.ratingAvg || 0} đánh giá)</Typography>
              {rx !== null && <Chip size="small" label={rx ? 'Thuốc kê đơn (Rx)' : 'Không kê đơn (OTC)'} color={rx ? 'warning' : 'success'} />}
              <Chip size="small" label={inStock ? 'Còn hàng' : 'Hết hàng'} color={inStock ? 'success' : 'default'} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatCurrency(product?.originPrice)}
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
              {product?.description || 'Sản phẩm chăm sóc sức khỏe chất lượng cao từ MedStore.'}
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item>
                <TextField
                  type="number"
                  size="small"
                  label="Số lượng"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  inputProps={{ min: 1, style: { width: 90 } }}
                />
              </Grid>
              <Grid item>
                <Button variant="contained" size="large" disabled={!inStock}>Thêm vào giỏ</Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" size="large" disabled={!inStock}>Mua ngay</Button>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Thông tin sản phẩm</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {/* <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">id</Typography><Typography variant="body1">{product?.id}</Typography></Grid> */}
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">name</Typography><Typography variant="body1">{product?.name}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">category</Typography><Typography variant="body1">{product?.category || 'Khác'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">manufacturer</Typography><Typography variant="body1">{product?.manufacturer || 'Đang cập nhật'}</Typography></Grid>
                {/* <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">manufactureId</Typography><Typography variant="body1">{product?.manufactureId || '—'}</Typography></Grid> */}
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">precription</Typography><Typography variant="body1">{String(product?.precription ?? '—')}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">originPrice</Typography><Typography variant="body1">{formatCurrency(product?.originPrice)}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">ratingAvg</Typography><Typography variant="body1">{product?.ratingAvg ?? 0}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">productDate</Typography><Typography variant="body1">{product?.productDate || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">quantity</Typography><Typography variant="body1">{product?.quantity ?? '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">currency</Typography><Typography variant="body1">{product?.currency || 'VND'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">soldQuantity</Typography><Typography variant="body1">{product?.soldQuantity ?? 0}</Typography></Grid>
                <Grid item xs={12}><Typography variant="body2" color="text.secondary">usage</Typography><Typography variant="body1">{product?.usage || '—'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="body2" color="text.secondary">note</Typography><Typography variant="body1">{product?.note || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">benefit</Typography><Typography variant="body1">{product?.benefit || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">sideEffect</Typography><Typography variant="body1">{product?.sideEffect || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">preserve</Typography><Typography variant="body1">{product?.preserve || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">questions</Typography><Typography variant="body1">{Array.isArray(product?.questions) ? `${product.questions.length} mục` : '—'}</Typography></Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Mô tả chi tiết</Typography>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {product?.description || 'Đang cập nhật nội dung chi tiết sản phẩm.'}
            </Typography>
          </Paper>
        </Box>

        {!!(product?.ingredients || [])?.length && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Thành phần (ingredients)</Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên</TableCell>
                    <TableCell>Hàm lượng</TableCell>
                    <TableCell>Đơn vị</TableCell>
                    <TableCell>Mô tả</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.ingredients.map((ing, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{ing?.name || '—'}</TableCell>
                      <TableCell>{ing?.amount ?? '—'}</TableCell>
                      <TableCell>{ing?.unit || '—'}</TableCell>
                      <TableCell>{ing?.description || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {!!(product?.questions || [])?.length && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Câu hỏi</Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <List dense>
                {product.questions.map((q, i) => (
                  <ListItem key={i} disableGutters>
                    <ListItemText primary={`• ${typeof q === 'string' ? q : JSON.stringify(q)}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
