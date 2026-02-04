import { useState, type PropsWithChildren } from 'react'
import type { User } from '../types/auth'
import { api } from '../services/api'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: PropsWithChildren) {
  function parseUserFromToken(token: string): User {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, email: payload.email }
  }

  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token')
    if (!token) return null

    try {
      return parseUserFromToken(token)
    } catch {
      localStorage.removeItem('token')
      return null
    }
  })

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
