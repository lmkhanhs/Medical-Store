import React, { useState, useEffect } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchCategories } from '../../api/http';
import AddCategoryModal from './AddCategoryModal';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchCategories(currentPage, pageSize);
      
      if (response.code === 200) {
        setCategories(response.data || []);
        
        setTotalPages(Math.ceil((response.totalElements || response.data?.length || 0) / pageSize));
      } else {
        setError(response.message || 'Không thể tải danh sách danh mục');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error loading categories:', err);
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

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleRefresh = () => {
    loadCategories();
  };

  const handleAddCategory = () => {
    setAddModalOpen(true);
  };

  const handleAddSuccess = (newCategory) => {
    setCategories(prev => [newCategory, ...prev]);
    setAddModalOpen(false);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (active) => {
    return active ? 'success' : 'error';
  };

  const getStatusText = (active) => {
    return active ? 'Hoạt động' : 'Không hoạt động';
  };

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <CategoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Quản lý Danh mục
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý các danh mục sản phẩm trong hệ thống
              </Typography>
            </Box>
          </Box>
        </Box>


        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {categories.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng danh mục
                    </Typography>
                  </Box>
                  <CategoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {categories.filter(cat => cat.active).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Đang hoạt động
                    </Typography>
                  </Box>
                  <VisibilityIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>

          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Tìm kiếm danh mục..."
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
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  size="small"
                >
                  Bộ lọc
                </Button>
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
                  onClick={handleAddCategory}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Thêm danh mục
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
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên danh mục</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Vị trí</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow
                    key={category.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'grey.50',
                        transition: 'all 0.2s ease-in-out'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                      <TableCell>
                        <Avatar
                          src={category.thumbnailUrl}
                          sx={{ width: 60, height: 60, borderRadius: 2 }}
                          variant="rounded"
                        >
                          <ImageIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {category.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {category.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.position}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(category.active)}
                          color={getStatusColor(category.active)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, category)}
                          color="primary"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
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


          {!loading && filteredCategories.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CategoryIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm danh mục đầu tiên'}
              </Typography>
            </Box>
          )}
        </Paper>


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <VisibilityIcon color="primary" />
            </ListItemIcon>
            <ListItemText>Xem chi tiết</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <EditIcon color="primary" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText>Xóa</ListItemText>
          </MenuItem>
        </Menu>

          
        <AddCategoryModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      </motion.div>
    </Container>
  );
};

export default CategoriesManagement;
