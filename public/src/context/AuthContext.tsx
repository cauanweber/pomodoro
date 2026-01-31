/**
 * =====================================================
 * =          Contexto de Autenticação Global           =
 * =====================================================
 *
 * Gerencia o estado de autenticação da aplicação.
 * Responsável por:
 * - Armazenar e expor o usuário autenticado
 * - Controlar login, registro e logout
 * - Persistir o token de autenticação
 * - Fornecer acesso ao estado auth via Context API
 */

/**
 * =====================================================
 * =               Bibliotecas Core                    =
 * =====================================================
 * Hooks e utilitários do React usados para criar
 * e consumir o contexto de autenticação.
 */

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'

/**
 * =====================================================
 * =               Tipos da Aplicação                  =
 * =====================================================
 * Tipagens centrais relacionadas à autenticação
 * e ao estado global do usuário.
 */

import type { User, AuthContextData } from '../types/auth'

/**
 * =====================================================
 * =                  Serviços                        =
 * =====================================================
 * Cliente HTTP responsável pela comunicação
 * com a API de autenticação.
 */

import { api } from '../services/api'

/**
 * =====================================================
 * =               Contexto de Autenticação            =
 * =====================================================
 * Centraliza estado e ações de auth da aplicação.
 */

const AuthContext = createContext<AuthContextData | null>(null)

/**
 * =====================================================
 * =               Provider de Auth                    =
 * =====================================================
 * Encapsula a aplicação e expõe o contexto
 * de autenticação para os componentes filhos.
 */

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)

  /**
   * =================================================
   * =         Utilitário de Parse do Token           =
   * =================================================
   * Extrai informações do usuário a partir
   * do payload do JWT.
   */
  function parseUserFromToken(token: string): User {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, email: payload.email }
  }

  /**
   * =================================================
   * =            Restauração de Sessão               =
   * =================================================
   * Reidrata o usuário no carregamento inicial
   * caso exista um token persistido.
   */
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setUser(parseUserFromToken(token))
    } catch {
      localStorage.removeItem('token')
    }
  }, [])

  /**
   * =================================================
   * =               Login do Usuário                =
   * =================================================
   * Autentica no backend, persiste o token
   * e atualiza o estado global.
   */
  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.token

    localStorage.setItem('token', token)
    setUser(parseUserFromToken(token))
  }

  /**
   * =================================================
   * =              Registro de Usuário              =
   * =================================================
   * Cria a conta e autentica automaticamente
   * após o registro bem-sucedido.
   */
  async function register(email: string, password: string) {
    const res = await api.post('/auth/register', { email, password })
    const token = res.data.token

    localStorage.setItem('token', token)
    setUser(parseUserFromToken(token))
  }

  /**
   * =================================================
   * =                 Logout                        =
   * =================================================
   * Remove o token persistido e limpa
   * o estado de autenticação.
   */
  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  /**
   * =================================================
   * =            Provider do Contexto               =
   * =================================================
   * Disponibiliza estado e ações de auth
   * para toda a aplicação.
   */
  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * =====================================================
 * =               Hook useAuth                        =
 * =====================================================
 * Garante acesso seguro ao contexto
 * apenas dentro do AuthProvider.
 */

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}