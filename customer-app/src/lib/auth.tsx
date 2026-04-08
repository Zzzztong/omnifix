import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from './api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  referralCode: string
  credits: number
  role: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('fixnest_token')
    if (token) {
      api.me().then(setUser).catch(() => localStorage.removeItem('fixnest_token')).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password })
    localStorage.setItem('fixnest_token', data.token)
    setUser(data.user)
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const data = await api.register({ name, email, password, phone })
    localStorage.setItem('fixnest_token', data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('fixnest_token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
