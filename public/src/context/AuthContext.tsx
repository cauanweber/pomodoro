import { createContext, useContext, useState } from 'react'
import { api } from '../services/api'

type User = {
  id: string
  email: string
}

type AuthContextData = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextData | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.token

    // Decodificar o userId do JWT ou pedir email do backend
    const payload = JSON.parse(atob(token.split('.')[1]))
    const user: User = { id: payload.sub, email }

    localStorage.setItem('token', token)
    setUser(user)
  }

  async function register(email: string, password: string) {
    const res = await api.post('/auth/register', { email, password })
    const token = res.data.token
    const payload = JSON.parse(atob(token.split('.')[1]))
    const user: User = { id: payload.sub, email }

    localStorage.setItem('token', token)
    setUser(user)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}