import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppChrome from './components/AppChrome'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CmsProvider } from './context/CmsContext'
import AdminCmsBannersPage from './pages/AdminCmsBannersPage'
import AdminCmsPagesPage from './pages/AdminCmsPagesPage'
import AdminCmsSettingsPage from './pages/AdminCmsSettingsPage'
import AdminCommandCenterPage from './pages/AdminCommandCenterPage'
import AdminCreateRiderPage from './pages/AdminCreateRiderPage'
import AdminCreateShopPage from './pages/AdminCreateShopPage'
import AdminCustomerDetailPage from './pages/AdminCustomerDetailPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import AdminLiveOrdersPage from './pages/AdminLiveOrdersPage'
import AdminRiderDetailPage from './pages/AdminRiderDetailPage'
import AdminRidersPage from './pages/AdminRidersPage'
import AdminShopDetailPage from './pages/AdminShopDetailPage'
import AdminShopsPage from './pages/AdminShopsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CmsPage from './pages/CmsPage'
import CreateOrderPage from './pages/CreateOrderPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotificationsPage from './pages/NotificationsPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import PublicShopPage from './pages/PublicShopPage'
import RegisterPage from './pages/RegisterPage'
import RiderJobsPage from './pages/RiderJobsPage'
import ShopDashboardPage from './pages/ShopDashboardPage'
import ShopMenuItemFormPage from './pages/ShopMenuItemFormPage'
import ShopMenuPage from './pages/ShopMenuPage'

function App() {
  return (
    <AuthProvider>
      <CmsProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app">
              <Routes>
                <Route element={<AppChrome />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shops/:slug" element={<PublicShopPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/p/:slug" element={<CmsPage />} />

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

                  <Route element={<ProtectedRoute roles={['rider']} />}>
                    <Route path="/rider/jobs" element={<RiderJobsPage />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="/admin" element={<AdminCommandCenterPage />} />
                    <Route path="/admin/live" element={<AdminLiveOrdersPage />} />
                    <Route path="/admin/customers" element={<AdminCustomersPage />} />
                    <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
                    <Route path="/admin/shops" element={<AdminShopsPage />} />
                    <Route path="/admin/shops/new" element={<AdminCreateShopPage />} />
                    <Route path="/admin/shops/:id" element={<AdminShopDetailPage />} />
                    <Route path="/admin/riders" element={<AdminRidersPage />} />
                    <Route path="/admin/riders/new" element={<AdminCreateRiderPage />} />
                    <Route path="/admin/riders/:id" element={<AdminRiderDetailPage />} />
                    <Route path="/admin/cms" element={<AdminCmsSettingsPage />} />
                    <Route path="/admin/cms/banners" element={<AdminCmsBannersPage />} />
                    <Route path="/admin/cms/pages" element={<AdminCmsPagesPage />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['shop']} />}>
                    <Route path="/shop" element={<ShopDashboardPage />} />
                    <Route path="/shop/menu" element={<ShopMenuPage />} />
                    <Route path="/shop/menu/new" element={<ShopMenuItemFormPage />} />
                    <Route path="/shop/menu/:id/edit" element={<ShopMenuItemFormPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </CartProvider>
      </CmsProvider>
    </AuthProvider>
  )
}

export default App
