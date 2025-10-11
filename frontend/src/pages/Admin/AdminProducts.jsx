import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import http, { fetchProducts } from '../../api/http';

function formatCurrencyVnd(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
}

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'VND',
    quantity: '',
    productDate: '',
    expirationDate: '',
    manufacturerId: '',
    categoryId: '',
    usage: '',
    benefit: '',
    sideEffect: '',
    note: '',
    preserve: '',
    ingredients: `[
  {"name": "Paracetamol", "amount": 500, "unit": "mg", "description": "Giảm đau, hạ sốt"},
  {"name": "Caffeine", "amount": 50, "unit": "mg", "description": "Tăng hiệu quả giảm đau"}
]`,
    precription: 'false'
  });

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchProducts(currentPage, pageSize);
      if (response.code === 200) {
        const list = response.data || [];
        setProducts(Array.isArray(list) ? list : []);
        const totalElements = response.totalElements || response.total || list.length;
        setTotalPages(Math.max(1, Math.ceil(Number(totalElements) / pageSize)));
      } else {
        setError(response.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page - 1); 
  };

  const handleRefresh = () => {
    loadProducts();
  };

  const handleOpenAdd = () => setAddOpen(true);
  const handleCloseAdd = () => { if (!submitting) setAddOpen(false); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleImagesChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };
  const handleSubmitAdd = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('currency', form.currency);
      fd.append('quantity', form.quantity);
      fd.append('productDate', form.productDate);
      fd.append('expirationDate', form.expirationDate);
      fd.append('manufacturerId', form.manufacturerId);
      fd.append('categoryId', form.categoryId);
      fd.append('usage', form.usage);
      fd.append('benefit', form.benefit);
      fd.append('sideEffect', form.sideEffect);
      fd.append('note', form.note);
      fd.append('preserve', form.preserve);
      fd.append('ingredients', form.ingredients); 
      fd.append('precription', form.precription);
      images.forEach((f) => fd.append('images', f));

      const res = await http.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      const created = res?.data?.data;
      if (created) {
        setProducts((prev) => [{
          name: created.name,
          description: created.description,
          originPrice: created.originPrice || form.price,
          discount: created.discount ?? 0,
          quantity: created.quantity,
          soldQuantity: created.soldQuantity || 0,
          ratingAvg: created.ratingAvg || 0,
          imageUrl: Array.isArray(created.imageUrl) ? created.imageUrl[0] : created.imageUrl,
          productDate: created.productDate,
          expirationDate: created.expirationDate
        }, ...prev]);
      }
      setAddOpen(false);
      setImages([]);
      setForm((prev) => ({ ...prev, name: '', description: '', price: '', quantity: '', productDate: '', expirationDate: '', manufacturerId: '', categoryId: '', usage: '', benefit: '', sideEffect: '', note: '', preserve: '' }));
    } catch (e) {
      console.error('Create product error:', e);
      alert(e?.response?.data?.message || 'Không thể tạo sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || desc.includes(q);
  });

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <InventoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Sản phẩm
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Xem và quản lý danh sách sản phẩm trong hệ thống
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{products.length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Tổng sản phẩm</Typography>
                  </Box>
                  <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{products.filter(p => Number(p.discount) > 0).length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Đang giảm giá</Typography>
                  </Box>
                  <LocalOfferIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{products.reduce((s, p) => s + Number(p.soldQuantity || 0), 0)}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Tổng đã bán</Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={handleSearch}
                  size="small"
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Làm mới">
                  <IconButton onClick={handleRefresh} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Thêm sản phẩm
                </Button>
              </Box>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Hình ảnh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giá gốc</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giảm giá</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tồn kho</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đã bán</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đánh giá</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>NSX</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>HSD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id || product.name} hover>
                    <TableCell>
                      <Avatar src={product.imageUrl} variant="rounded" sx={{ width: 60, height: 60, borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 360 }} color="text.secondary">{product.description}</Typography>
                    </TableCell>
                    <TableCell>{formatCurrencyVnd(product.originPrice)}</TableCell>
                    <TableCell>
                      {product.discount ? (
                        <Chip label={`-${product.discount}%`} color="error" size="small" sx={{ fontWeight: 600 }} />
                      ) : (
                        <Chip label="0%" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.soldQuantity}</TableCell>
                    <TableCell>{Number(product.ratingAvg || 0).toFixed(1)}</TableCell>
                    <TableCell>{product.productDate}</TableCell>
                    <TableCell>{product.expirationDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>


          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>
        <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="md" fullWidth>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Tên sản phẩm" name="name" value={form.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Giá (price)" name="price" type="number" value={form.price} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Mô tả" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Tiền tệ" name="currency" value={form.currency} onChange={handleChange} fullWidth>
                  <MenuItem value="VND">VND</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Số lượng" name="quantity" type="number" value={form.quantity} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Ngày sản xuất (YYYY/MM/DD)" name="productDate" value={form.productDate} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Hạn sử dụng (YYYY/MM/DD)" name="expirationDate" value={form.expirationDate} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Manufacturer ID" name="manufacturerId" value={form.manufacturerId} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Category ID" name="categoryId" value={form.categoryId} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cách dùng (usage)" name="usage" value={form.usage} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Công dụng (benefit)" name="benefit" value={form.benefit} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tác dụng phụ (sideEffect)" name="sideEffect" value={form.sideEffect} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Ghi chú (note)" name="note" value={form.note} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Bảo quản (preserve)" name="preserve" value={form.preserve} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Precription (true/false)" name="precription" value={form.precription} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Ingredients (JSON)" name="ingredients" value={form.ingredients} onChange={handleChange} fullWidth multiline minRows={6} helperText="Nhập mảng JSON như ví dụ trong yêu cầu" />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label">
                  Chọn ảnh (nhiều ảnh)
                  <input type="file" hidden multiple accept="image/*" onChange={handleImagesChange} />
                </Button>
                <Typography variant="caption" sx={{ ml: 2 }}>{images.length ? `${images.length} file đã chọn` : 'Chưa chọn ảnh'}</Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAdd} disabled={submitting}>Hủy</Button>
            <Button onClick={handleSubmitAdd} variant="contained" disabled={submitting}>Tạo sản phẩm</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default AdminProducts;


