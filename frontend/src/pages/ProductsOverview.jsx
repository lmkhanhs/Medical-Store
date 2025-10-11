import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Rating,
  Button,
  Breadcrumbs,
  Link,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';

function formatCurrencyVnd(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
}

function getDiscountedPrice(originPrice, discount) {
  if (discount === null || discount === undefined || Number(discount) === 0) return originPrice;
  return Number(originPrice) * (1 - Number(discount) / 100);
}

export default function ProductsOverview() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`http://127.0.0.1:8080/api/v1/products?page=${page}&size=${PAGE_SIZE}`);
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json?.content || json?.data || []);
        if (mounted) {
          setProducts(Array.isArray(list) ? list : []);
          const totalPages = json?.totalPages || json?.pagination?.totalPages;
          if (totalPages !== undefined) setHasNext(page < Number(totalPages) - 1);
          else setHasNext((Array.isArray(list) ? list.length : 0) === PAGE_SIZE);
        }
      } catch (e) {
        if (mounted) setError('Không thể tải sản phẩm');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page]);

  const displayProducts = useMemo(() => products, [products]);

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50', minHeight: '60vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Trang chủ
          </Link>
          <Typography color="text.primary">Tổng quan sản phẩm</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold' }}>
            Tổng quan sản phẩm
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hiển thị các sản phẩm mới nhất từ hệ thống.
          </Typography>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        <Grid container spacing={3}>
          {(loading ? Array.from({ length: 10 }) : displayProducts).map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={item?.id || index}>
              {loading ? (
                <Card sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" height={180} />
                  <Box sx={{ p: 2.5 }}>
                    <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Card>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card
                    onClick={() => navigate(`/product/${item.id}`)}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': { boxShadow: theme.shadows[10], transform: 'translateY(-6px)' },
                      transition: 'all .3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={item.imageUrl || 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop'}
                        alt={item.name}
                        sx={{ height: 180, objectFit: 'cover' }}
                      />
                      {!!item?.discount && (
                        <Chip label={`-${item.discount}%`} color="error" size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 'bold' }} />
                      )}
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={Number(item.ratingAvg) || 0} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>({Number(item.ratingAvg) || 0})</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {formatCurrencyVnd(getDiscountedPrice(item.originPrice, item.discount))}
                        </Typography>
                        {item.discount ? (
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {formatCurrencyVnd(item.originPrice)}
                          </Typography>
                        ) : null}
                      </Box>
                      <Button fullWidth variant="contained">Thêm vào giỏ</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4 }}>
          <Button variant="outlined" disabled={page === 0 || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>
            Trang trước
          </Button>
          <Typography variant="body2">Trang {page + 1}</Typography>
          <Button variant="outlined" disabled={!hasNext || loading} onClick={() => setPage(p => p + 1)}>
            Trang sau
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
