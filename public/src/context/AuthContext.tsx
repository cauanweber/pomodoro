import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { User, AuthContextData } from '../types/auth'
import { api } from '../services/api'

const AuthContext = createContext<AuthContextData | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)

  function parseUserFromToken(token: string): User {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, email: payload.email }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setUser(parseUserFromToken(token))
    } catch {
      localStorage.removeItem('token')
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.token

    localStorage.setItem('token', token)
    setUser(parseUserFromToken(token))
  }

  async function register(email: string, password: string) {
    const res = await api.post('/auth/register', { email, password })
    const token = res.data.token

    localStorage.setItem('token', token)
    setUser(parseUserFromToken(token))
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
