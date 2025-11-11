import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ConsultPage from './pages/ConsultPage';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SearchResults from './components/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsOverview from './pages/ProductsOverview';
<<<<<<< HEAD
import CartPage from './pages/CartPage';
=======
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSearchResults([]);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/*" element={
            <>
              <Header onSearch={handleSearch} />
              <main>
                <Routes>
                  <Route path="/" element={
                    searchQuery ? 
                      <SearchResults searchQuery={searchQuery} searchResults={searchResults} /> : 
                      <HomePage />
                  } />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/consult" element={<ConsultPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<ProductsOverview />} />
                  <Route path="/search" element={<SearchResults />} />
<<<<<<< HEAD
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute requiredRole="USER">
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
=======
>>>>>>> b5ee9664cc5897193156b6741d46e015c812dcb0
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
