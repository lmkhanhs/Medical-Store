import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Typography,
  Breadcrumbs,
  Link,
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
  ListItem,
  ListItemText
} from '@mui/material';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) throw new Error('missing id');
        setLoading(true);
        setError('');
        const res = await fetch(`http://127.0.0.1:8080/api/v1/products/detail/${id}`);
        const json = await res.json();
        const data = json?.data || null;
        if (mounted) setProduct(data);
      } catch {
        if (mounted) setError('Không thể tải thông tin sản phẩm');
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

  const formatCurrency = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: product?.currency || 'VND' })
      .format(Number(price || 0));

  const inStock = (product?.quantity ?? 0) > 0;
  const rx = product?.precription ?? product?.prescription ?? null;

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
