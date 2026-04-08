import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import BottomNav from './components/BottomNav'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import Booking from './pages/Booking'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Login from './pages/Login'

const NO_NAV_PREFIXES = ['/booking', '/order-success', '/login']

function Layout() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const showNav = !NO_NAV_PREFIXES.some(p => location.pathname.startsWith(p))

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-blue-600 text-2xl">🏠</div>
    </div>
  )

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryDetail />} />
        <Route path="/booking/:catId/:serviceId" element={user ? <Booking /> : <Navigate to="/login" replace />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
      </Routes>
      {showNav && <BottomNav />}
      <ChatWidget />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}
