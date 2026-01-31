/**
 * ==============================================
 * =           Tipos de Autenticação             =
 * ==============================================
 * Tipos centrais usados pelo AuthContext
 * e demais partes do frontend relacionadas
 * à autenticação.
 */

export type User = {
  id: string
  email: string
}

export type AuthContextData = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}