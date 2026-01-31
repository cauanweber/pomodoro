/**
 * =====================================================
 * =              Proteção de Rotas                    =
 * =====================================================
 *
 * Componente responsável por proteger rotas
 * que exigem autenticação do usuário.
 * Redireciona para login caso não autenticado.
 */

/**
 * =====================================================
 * =               Bibliotecas Core                    =
 * =====================================================
 * Utilitários do React Router para redirecionamento
 * e tipos básicos do React.
 */

import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * =====================================================
 * =              Contexto de Autenticação             =
 * =====================================================
 * Hook responsável por fornecer o estado
 * de autenticação do usuário.
 */

import { useAuth } from '../context/AuthContext'

/**
 * =====================================================
 * =               Tipos do Componente                 =
 * =====================================================
 * Tipagem das propriedades aceitas pelo
 * wrapper de proteção de rotas.
 */

type ProtectedRouteProps = {
  children: ReactNode
}

/**
 * =====================================================
 * =             Componente ProtectedRoute             =
 * =====================================================
 * Renderiza o conteúdo apenas se o usuário
 * estiver autenticado.
 */

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}