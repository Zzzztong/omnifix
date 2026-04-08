import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Technicians from './pages/Technicians'
import Coupons from './pages/Coupons'
import Login from './pages/Login'

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('admin_token'))

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    setAuthed(!!token)
  }, [])

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  return (
    <BrowserRouter>
      <Layout onLogout={() => { localStorage.removeItem('admin_token'); setAuthed(false) }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/technicians" element={<Technicians />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/reviews" element={<div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">评价管理功能开发中...</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
