import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import AdminCreateShopPage from './pages/AdminCreateShopPage'
import AdminShopDetailPage from './pages/AdminShopDetailPage'
import AdminShopsPage from './pages/AdminShopsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CreateOrderPage from './pages/CreateOrderPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotificationsPage from './pages/NotificationsPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import PublicShopPage from './pages/PublicShopPage'
import RegisterPage from './pages/RegisterPage'
import ShopDashboardPage from './pages/ShopDashboardPage'
import ShopMenuItemFormPage from './pages/ShopMenuItemFormPage'
import ShopMenuPage from './pages/ShopMenuPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app">
            <AppHeader />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shops/:slug" element={<PublicShopPage />} />
              <Route path="/cart" element={<CartPage />} />

              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['admin', 'customer', 'rider', 'shop']} />}>
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['customer']} />}>
                <Route path="/orders/new" element={<CreateOrderPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin/shops" element={<AdminShopsPage />} />
                <Route path="/admin/shops/new" element={<AdminCreateShopPage />} />
                <Route path="/admin/shops/:id" element={<AdminShopDetailPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['shop']} />}>
                <Route path="/shop" element={<ShopDashboardPage />} />
                <Route path="/shop/menu" element={<ShopMenuPage />} />
                <Route path="/shop/menu/new" element={<ShopMenuItemFormPage />} />
                <Route path="/shop/menu/:id/edit" element={<ShopMenuItemFormPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
