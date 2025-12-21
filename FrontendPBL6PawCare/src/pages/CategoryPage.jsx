import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Link,
  Rating,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import http from '../api/http';

const readableTitle = (slug) =>
  decodeURIComponent(slug || '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const parseVndToNumber = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v !== 'string') return 0;
  const digits = v.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

const isNonEmptyText = (v) => typeof v === 'string' && v.trim().length > 0;

const formatVnd = (value) => {
  const n = typeof value === 'number' ? value : parseVndToNumber(value);
  if (!Number.isFinite(n) || n <= 0) return 'Liên hệ';
  return `${n.toLocaleString('vi-VN')} đ`;
};

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const title = useMemo(() => readableTitle(slug), [slug]);
  const categoryId = searchParams.get('categoryId');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDemoProducts = (name) => [
    {
      id: 101,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 102,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 103,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 104,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 105,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 106,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 107,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
    {
      id: 108,
      name: `${name} – Thuốc`,
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop',
      rating: 5.0,
      reviews: 200,
    },
  ];

  useEffect(() => {
    if (!categoryId) {
      setProducts(getDemoProducts(title));
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await http.get(
          `http://13.231.191.87:8080/api/v1/products/filter?categoryId=${encodeURIComponent(categoryId)}`
        );

        const apiData = res?.data?.data || [];
        const normalized = Array.isArray(apiData)
          ? apiData.map((p) => ({
              ...p,
              price: p.discountPrice ?? p.originPrice ?? p.price,
              originalPrice: p.originPrice ?? p.originalPrice,
              discount: p.discountPercent ?? p.discount,
              rating: p.ratingAvg ?? p.rating,
              reviews: p.reviewCount ?? p.reviews ?? 0,
            }))
          : [];

        setProducts(normalized);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, title]);

  const CARD_IMAGE_HEIGHT = 180;

  const ProductCard = ({ product, isLoading }) => {
    const name = isNonEmptyText(product?.name) ? product.name : 'Sản phẩm';
    const imageUrl =
      product?.imageUrl ||
      product?.image ||
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=500&fit=crop';

    const discountNum = toNum(product?.discount);
    const showDiscount = discountNum > 0;

    const priceNum = toNum(product?.price);
    const originalNum = toNum(product?.originalPrice) || parseVndToNumber(product?.originalPrice) || toNum(product?.originPrice);

    const priceText = formatVnd(priceNum);
    const showOriginal = originalNum > 0 && priceNum > 0 && originalNum > priceNum;
    const originalText = showOriginal ? formatVnd(originalNum) : '\u00A0';

    const ratingNum = Math.max(0, Math.min(5, toNum(product?.rating)));
    const reviewsNum = toNum(product?.reviews) || toNum(product?.reviewCount);

    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all .25s ease',
          cursor: isLoading ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          '&:hover': isLoading ? {} : { boxShadow: theme.shadows[10], transform: 'translateY(-6px)' },
        }}
        onClick={() => {
          if (isLoading || !product) return;
          const id = product?.id || product?.productId;
          if (id) navigate(`/product/${id}`);
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={CARD_IMAGE_HEIGHT} />
          ) : (
            <>
              <CardMedia component="img" image={imageUrl} alt={name} sx={{ height: CARD_IMAGE_HEIGHT, objectFit: 'cover' }} />
              {showDiscount ? (
                <Chip
                  label={`-${discountNum.toFixed(0)}%`}
                  color="error"
                  size="small"
                  sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 'bold' }}
                />
              ) : null}
            </>
          )}
        </Box>

        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
          {isLoading ? (
            <>
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
            </>
          ) : (
            <>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.3,
                  minHeight: 42,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minHeight: 20 }}>
                <Rating value={ratingNum || 0} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({reviewsNum.toLocaleString('vi-VN')})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2, minHeight: 28 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.1 }}>
                  {priceText}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: showOriginal ? 'line-through' : 'none' }}>
                  {originalText}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 'auto', borderRadius: 2, py: 1.1, fontWeight: 'bold' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const id = product?.id || product?.productId;
                  if (id) navigate(`/product/${id}`);
                }}
              >
                Chọn mua
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50', minHeight: '60vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Trang chủ
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Danh sách sản phẩm liên quan đến &quot;{title}&quot;.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {(loading ? Array.from({ length: 8 }) : products).map((product, index) => (
            <Grid item xs={12} sm={6} md={3} key={loading ? index : product?.id || product?.productId || index}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: (index % 8) * 0.03 }}
                style={{ height: '100%' }}
              >
                <ProductCard product={product} isLoading={loading} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
