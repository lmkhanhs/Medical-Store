import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
    productGrowth: 0
  });

  const revenueData = [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 139 },
    { month: 'Mar', revenue: 2000, orders: 980 },
    { month: 'Apr', revenue: 2780, orders: 390 },
    { month: 'May', revenue: 1890, orders: 480 },
    { month: 'Jun', revenue: 2390, orders: 380 },
    { month: 'Jul', revenue: 3490, orders: 430 }
  ];

  const categoryData = [
    { name: 'Thuốc', value: 35, color: '#8884d8' },
    { name: 'Thực phẩm chức năng', value: 25, color: '#82ca9d' },
    { name: 'Trang thiết bị y tế', value: 20, color: '#ffc658' },
    { name: 'Thực phẩm dinh dưỡng', value: 15, color: '#ff7c7c' },
    { name: 'Khác', value: 5, color: '#8dd1e1' }
  ];

  const recentOrders = [
    { id: '#001', customer: 'Nguyễn Văn A', amount: 250000, status: 'completed', time: '2 phút trước' },
    { id: '#002', customer: 'Trần Thị B', amount: 180000, status: 'pending', time: '15 phút trước' },
    { id: '#003', customer: 'Lê Văn C', amount: 320000, status: 'shipped', time: '1 giờ trước' },
    { id: '#004', customer: 'Phạm Thị D', amount: 150000, status: 'completed', time: '2 giờ trước' },
    { id: '#005', customer: 'Hoàng Văn E', amount: 280000, status: 'processing', time: '3 giờ trước' }
  ];

  const topProducts = [
    { name: 'Paracetamol 500mg', sales: 1250, revenue: 6250000 },
    { name: 'Vitamin C 1000mg', sales: 980, revenue: 4900000 },
    { name: 'Omega 3', sales: 750, revenue: 3750000 },
    { name: 'Canxi D3', sales: 650, revenue: 3250000 },
    { name: 'Glucosamine', sales: 520, revenue: 2600000 }
  ];

  useEffect(() => {

    setLoading(true);
    setTimeout(() => {
      setStats({
        totalRevenue: 125000000,
        totalOrders: 2847,
        totalUsers: 1250,
        totalProducts: 450,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        userGrowth: 15.2,
        productGrowth: 5.7
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, growth, icon, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15, ${color}05)` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
                {prefix}{value.toLocaleString('vi-VN')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {growth > 0 ? (
                  <ArrowUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <ArrowDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: growth > 0 ? 'success.main' : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {Math.abs(growth)}%
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      case 'processing': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'shipped': return 'Đã giao';
      case 'processing': return 'Đang xử lý';
      default: return status;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  Bảng điều khiển Admin
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tổng quan về hoạt động của MedStore
                </Typography>
              </Box>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton
                  onClick={() => window.location.reload()}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng doanh thu"
                value={stats.totalRevenue}
                growth={stats.revenueGrowth}
                icon={<MoneyIcon />}
                color="#4caf50"
                prefix="₫"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                growth={stats.orderGrowth}
                icon={<ShoppingCartIcon />}
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng người dùng"
                value={stats.totalUsers}
                growth={stats.userGrowth}
                icon={<PeopleIcon />}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                growth={stats.productGrowth}
                icon={<InventoryIcon />}
                color="#9c27b0"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>

            <Grid item xs={12} lg={8}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Biểu đồ doanh thu theo tháng
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value, name) => [
                        name === 'revenue' ? `₫${value.toLocaleString('vi-VN')}` : value,
                        name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'
                      ]} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4caf50"
                        strokeWidth={3}
                        dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Phân bố theo danh mục
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    {categoryData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: item.color,
                            borderRadius: '50%',
                            mr: 1
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

 
          <Grid container spacing={3}>
    
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Đơn hàng gần đây
                  </Typography>
                  <List>
                    {recentOrders.map((order, index) => (
                      <React.Fragment key={order.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <ShoppingCartIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {order.id}
                                </Typography>
                                <Chip
                                  label={getStatusText(order.status)}
                                  color={getStatusColor(order.status)}
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {order.customer}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                  ₫{order.amount.toLocaleString('vi-VN')} • {order.time}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentOrders.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </motion.div>
            </Grid>

      
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Sản phẩm bán chạy
                  </Typography>
                  <List>
                    {topProducts.map((product, index) => (
                      <React.Fragment key={product.name}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                              <PharmacyIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {product.sales} sản phẩm đã bán
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                  ₫{product.revenue.toLocaleString('vi-VN')}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip
                              label={`#${index + 1}`}
                              color="primary"
                              size="small"
                              icon={<StarIcon />}
                            />
                          </Box>
                        </ListItem>
                        {index < topProducts.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
