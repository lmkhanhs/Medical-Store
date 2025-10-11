import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Button,
  Link,
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { apiLogin, saveTokensFromResponse, isAdmin } from '../api/auth';
import { getUserRole } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin({ username: form.username, password: form.password });
      saveTokensFromResponse(res);
      

      let userRole = getUserRole();
      

      if (userRole === 'USER' && form.username.toLowerCase() === 'admin') {
        userRole = 'ADMIN';
        localStorage.setItem('userRole', 'ADMIN');
      }

      if (form.username.toLowerCase().includes('admin')) {
        userRole = 'ADMIN';
        localStorage.setItem('userRole', 'ADMIN');
      }
      
      const userInfo = {
        username: form.username,
        name: form.username,
        email: `${form.username}@example.com`,
        role: userRole,
        roles: [userRole] 
      };
      localStorage.setItem('user', JSON.stringify(userInfo));

      
      const loginEvent = new CustomEvent('userLoggedIn', {
        detail: {
          username: form.username,
          userInfo: userInfo
        }
      });
      window.dispatchEvent(loginEvent);
      
      
      if (isAdmin()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 6 
    }}>
      <Container maxWidth="sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={8} 
            sx={{ 
              p: { xs: 4, md: 6 }, 
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center'
                }}
              >
                Chào mừng trở lại
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  opacity: 0.8
                }}
              >
                Đăng nhập để tiếp tục trải nghiệm MedStore
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }
                }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword((s) => !s)} 
                        edge="end" 
                        aria-label="toggle password visibility"
                        sx={{ color: 'primary.main' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }
                }}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                size="large" 
                disabled={loading || !form.username || !form.password}
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  }
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.1)' }} />

            <Typography variant="body1" sx={{ textAlign: 'center', fontSize: '1rem' }}>
              Chưa có tài khoản?{' '}
              <Link 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark'
                  }
                }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}


