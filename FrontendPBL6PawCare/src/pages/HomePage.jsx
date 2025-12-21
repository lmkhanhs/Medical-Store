import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import http, { fetchTopSellingProducts } from '../api/http';
import { formatCurrencyVnd, getFinalPrice } from '../utils/productPrice';

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Link,
  Paper,
  Rating,
  Skeleton,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  EmojiEvents as TrophyIcon,
  FlashOn as FlashIcon,
  Healing as HealingIcon,
  LocalShipping as LocalShippingIcon,
  Pets as PetsIcon,
  Psychology as PsychologyIcon,
  SupportAgent as SupportAgentIcon,
  Verified as VerifiedIcon,
  Whatshot as FireIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const flashSaleScrollRef = useRef(null);
  const bestSellerScrollRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loadingTopSelling, setLoadingTopSelling] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);

  const CARD_WIDTH = 280;
  const IMAGE_HEIGHT = 200;

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const isNonEmptyText = (v) => typeof v === 'string' && v.trim().length > 0;

  const heroSlides = [
    {
      id: 1,
      title: 'Chăm sóc thú cưng thông minh với công nghệ AI',
      subtitle: 'Sử dụng AI để chẩn đoán các loại côn trùng gây hại cho thú cưng',
      primaryLabel: 'Xem sản phẩm',
      // secondaryLabel: 'Thử AI Hub',
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
    },
    {
      id: 2,
      title: 'Chăm sóc sức khỏe toàn diện cho thú cưng',
      subtitle: 'Thức ăn dinh dưỡng, vitamin, sữa tắm, phụ kiện chất lượng cao. Giao hàng nhanh chóng toàn quốc',
      primaryLabel: 'Xem sản phẩm',
      secondaryLabel: 'Tư vấn bác sĩ thú y',
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
    },
    {
      id: 3,
      title: 'Ưu đãi đặc biệt - Giảm giá lên đến 50%',
      subtitle: 'Flash sale hàng ngày với hàng ngàn sản phẩm chăm sóc thú cưng chất lượng cao',
      primaryLabel: 'Mua ngay',
      secondaryLabel: 'Xem ưu đãi',
      imageUrl: 'https://phunugioi.com/wp-content/uploads/2022/06/Anh-cho-cute.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const quickActions = [
    { id: 1, icon: <PetsIcon sx={{ fontSize: 40 }} />, title: 'Mua sắm', route: '/products' },
    { id: 2, icon: <HealingIcon sx={{ fontSize: 40 }} />, title: 'Tư vấn bác sĩ thú y', route: '/consult' },
    // { id: 3, icon: <PsychologyIcon sx={{ fontSize: 40 }} />, title: 'AI Hub', route: '/ai' },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await http.get('http://13.231.191.87:8080/api/v1/categories?page=0&size=20');
        const apiData = res?.data?.data || [];

        const normalized = Array.isArray(apiData)
          ? apiData
              .filter((item) => item && item.active)
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .slice(0, 9)
          : [];

        setFeaturedCategories(normalized);
      } catch (err) {
        setFeaturedCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadFlashSaleProducts = async () => {
      try {
        setLoadingFlashSale(true);
        const response = await http.get('/products/flash-selling', { params: { limit: 10 } });

        let products = [];
        if (Array.isArray(response?.data?.data)) products = response.data.data;
        else if (Array.isArray(response?.data)) products = response.data;
        else if (Array.isArray(response)) products = response;

        setFlashSaleProducts(products);
      } catch (err) {
        setFlashSaleProducts([]);
      } finally {
        setLoadingFlashSale(false);
      }
    };

    loadFlashSaleProducts();
  }, []);

  useEffect(() => {
    const loadTopSellingProducts = async () => {
      try {
        setLoadingTopSelling(true);
        const response = await fetchTopSellingProducts();

        let products = [];
        if (Array.isArray(response)) products = response;
        else if (Array.isArray(response?.data)) products = response.data;
        else if (Array.isArray(response?.content)) products = response.content;

        setTopSellingProducts(products);
      } catch (err) {
        setTopSellingProducts([]);
      } finally {
        setLoadingTopSelling(false);
      }
    };

    loadTopSellingProducts();
  }, []);

  const scrollByAmount = (ref, direction) => {
    if (!ref?.current) return;
    const amount = (CARD_WIDTH + 16) * 2;
    ref.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const ProductCard = ({ product, variant }) => {
    const discountPercentNum = toNum(product?.discountPercent);
    const showDiscountChip = discountPercentNum > 0;
    const soldQtyNum = toNum(product?.soldQuantity);

    const imageUrl = product?.imageUrl || 'https://via.placeholder.com/280x200?text=No+Image';
    const name = isNonEmptyText(product?.name) ? product.name : 'Sản phẩm';
    const description = isNonEmptyText(product?.description) ? product.description.trim() : '';

    const quantityNum = Number.isFinite(Number(product?.quantity)) ? Number(product.quantity) : null;
    const stockText = quantityNum === null ? '' : `Tồn kho: ${quantityNum.toLocaleString('vi-VN')}`;

    let finalPrice = 0;
    let originPrice = toNum(product?.originPrice);

    if (variant === 'flash') {
      finalPrice = toNum(product?.discountPrice ?? product?.salePrice ?? product?.price ?? product?.originPrice);
    } else {
      finalPrice = toNum(getFinalPrice(product));
    }

    const showOriginPrice = originPrice > 0 && finalPrice > 0 && originPrice > finalPrice;

    const ratingAvgNum = toNum(product?.ratingAvg);

    return (
      <Card
        onClick={() => navigate(`/product/${product?.id}`)}
        sx={{
          width: CARD_WIDTH,
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.25s',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[10] },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia component="img" image={imageUrl} alt={name} sx={{ height: IMAGE_HEIGHT, objectFit: 'cover' }} />
          {showDiscountChip ? (
            <Chip
              label={`-${discountPercentNum.toFixed(1)}%`}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: '#D32F2F',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                height: 28,
              }}
            />
          ) : null}
          {soldQtyNum > 0 ? (
            <Chip
              label={`Đã bán: ${soldQtyNum.toLocaleString('vi-VN')}`}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          ) : null}
        </Box>

        <CardContent
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 1.25,
              minHeight: 44,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              fontWeight: 600,
            }}
          >
            {name}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mb: variant === 'best' ? 1 : 1.25,
              minHeight: 18,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description || '\u00A0'}
          </Typography>

          {variant === 'best' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: 20 }}>
              <Rating value={ratingAvgNum} precision={0.1} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                ({ratingAvgNum.toFixed(1)})
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 1, minHeight: 20 }} />
          )}

          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 0.5,
              fontSize: '1.1rem',
              lineHeight: 1.1,
            }}
          >
            {formatCurrencyVnd(finalPrice)}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              minHeight: 20,
              color: 'text.secondary',
              textDecoration: showOriginPrice ? 'line-through' : 'none',
              mb: variant === 'flash' ? 1 : 0.75,
            }}
          >
            {showOriginPrice ? formatCurrencyVnd(originPrice) : '\u00A0'}
          </Typography>

          {variant === 'flash' ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: '#FFE0B2',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                mb: 1.25,
                width: 'fit-content',
              }}
            >
              <FireIcon sx={{ fontSize: 16, color: '#FF9800' }} />
              <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 'bold' }}>
                Ưu đãi giá sốc
              </Typography>
            </Box>
          ) : null}

          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, minHeight: 18 }}>
            {stockText || '\u00A0'}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product?.id}`);
            }}
            sx={{
              mt: 'auto',
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2,
              py: 1.2,
              '&:hover': { bgcolor: theme.palette.primary.dark },
            }}
          >
            Chọn mua
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          overflow: 'hidden',
          minHeight: { xs: 400, md: 500 },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 4, md: 8 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold', mb: 2, lineHeight: 1.2 }}>
                    {heroSlides[currentSlide].title}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    {heroSlides[currentSlide].subtitle}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/products')}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        px: 4,
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      {heroSlides[currentSlide].primaryLabel}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[20] }}>
                    <CardMedia
                      component="img"
                      image={heroSlides[currentSlide].imageUrl}
                      alt={heroSlides[currentSlide].title}
                      sx={{ height: { xs: 250, md: 350 }, objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          </AnimatePresence>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
            {heroSlides.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: currentSlide === index ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>

          <IconButton
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            sx={{
              position: 'absolute',
              right: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Container>
      </Box>

      <Box sx={{ py: 4, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={6} md={6} key={action.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => navigate(action.route)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s',
                      borderRadius: 3,
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{action.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khám phá ngay
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <TrophyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Danh mục nổi bật
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {loadingCategories && featuredCategories.length === 0
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
                        <Skeleton variant="circular" width={56} height={56} sx={{ mx: 'auto', mb: 2 }} />
                        <Skeleton variant="text" width="80%" sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                      </Card>
                    </Grid>
                  ))
                : featuredCategories.map((category, index) => {
                    const slug = (category.name || '').trim().replace(/\s+/g, '-');
                    return (
                      <Grid item xs={6} sm={4} md={2} key={category.id || index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card
                            onClick={() =>
                              navigate(
                                `/category/${encodeURIComponent(slug)}?categoryId=${encodeURIComponent(category.id)}`
                              )
                            }
                            sx={{
                              height: '100%',
                              cursor: 'pointer',
                              textAlign: 'center',
                              p: 3,
                              borderRadius: 3,
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[8],
                                bgcolor: 'primary.light',
                                color: 'white',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {category.thumbnailUrl ? (
                                <CardMedia
                                  component="img"
                                  image={category.thumbnailUrl}
                                  alt={category.name}
                                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                              )}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {category.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {isNonEmptyText(category.description) ? category.description : '\u00A0'}
                            </Typography>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: '#E3F2FD', position: 'relative' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', color: '#FFA726', fontSize: { xs: '1.5rem', md: '2rem' } }}
                >
                  ƯU ĐÃI TỐT NHẤT
                </Typography>
                <FlashIcon sx={{ fontSize: 32, color: '#FFA726' }} />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', color: theme.palette.primary.main, fontSize: { xs: '1.5rem', md: '2rem' } }}
                >
                  GIÁ TỐT NHẤT
                </Typography>
              </Box>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => scrollByAmount(flashSaleScrollRef, 'left')}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Box
                ref={flashSaleScrollRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 2,
                  scrollBehavior: 'smooth',
                  alignItems: 'stretch',
                  '&::-webkit-scrollbar': { height: 8 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 4 },
                }}
              >
                {loadingFlashSale ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', py: 4, alignItems: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải sản phẩm flash sale...
                    </Typography>
                  </Box>
                ) : flashSaleProducts.length === 0 ? (
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có sản phẩm flash sale
                    </Typography>
                  </Box>
                ) : (
                  flashSaleProducts.map((product, index) => (
                    <motion.div
                      key={product?.id ?? index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      style={{ minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH, display: 'flex' }}
                    >
                      <ProductCard product={product} variant="flash" />
                    </motion.div>
                  ))
                )}
              </Box>

              <IconButton
                onClick={() => scrollByAmount(flashSaleScrollRef, 'right')}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/products');
                }}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Xem tất cả &gt;
              </Link>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Paper sx={{ px: 4, py: 1.5, borderRadius: 4, bgcolor: '#D32F2F', color: 'white' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Sản phẩm bán chạy
                </Typography>
              </Paper>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/products');
                }}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Xem tất cả &gt;
              </Link>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => scrollByAmount(bestSellerScrollRef, 'left')}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Box
                ref={bestSellerScrollRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 2,
                  scrollBehavior: 'smooth',
                  alignItems: 'stretch',
                  '&::-webkit-scrollbar': { height: 8 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 4 },
                }}
              >
                {loadingTopSelling ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', py: 4, alignItems: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải sản phẩm bán chạy...
                    </Typography>
                  </Box>
                ) : topSellingProducts.length === 0 ? (
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có sản phẩm bán chạy
                    </Typography>
                  </Box>
                ) : (
                  topSellingProducts.map((product, index) => (
                    <motion.div
                      key={product?.id ?? index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      style={{ minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH, display: 'flex' }}
                    >
                      <ProductCard product={product} variant="best" />
                    </motion.div>
                  ))
                )}
              </Box>

              <IconButton
                onClick={() => scrollByAmount(bestSellerScrollRef, 'right')}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: theme.shadows[4],
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    borderRadius: 3,
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Đổi trả trong 30 ngày
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chính sách đổi trả linh hoạt và minh bạch
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    borderRadius: 3,
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                  }}
                >
                  <SupportAgentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Tư vấn cùng bác sĩ thú y
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đội ngũ bác sĩ thú y giàu kinh nghiệm hỗ trợ 24/7
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    borderRadius: 3,
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                  }}
                >
                  <LocalShippingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Giao hàng nhanh chóng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giao hàng toàn quốc trong 24-48 giờ
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                    borderRadius: 3,
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Sản phẩm chính hãng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    100% sản phẩm có giấy phép và nguồn gốc rõ ràng
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
