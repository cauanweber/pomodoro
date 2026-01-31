/**
 * =====================================================
 * =                 Página de Login                  =
 * =====================================================
 *
 * Tela responsável por autenticar o usuário.
 * Permite login com email e senha e redireciona
 * para o dashboard após autenticação.
 */

/**
 * =====================================================
 * =               Bibliotecas Core                    =
 * =====================================================
 * Hooks do React e utilitários de navegação
 * do React Router.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * =====================================================
 * =              Contexto de Autenticação             =
 * =====================================================
 * Hook responsável por executar o login
 * e acessar o estado de autenticação.
 */

import { useAuth } from '../context/AuthContext'

/**
 * =====================================================
 * =                Componente Login                  =
 * =====================================================
 * Controla o formulário de autenticação e
 * executa o fluxo de login do usuário.
 */

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * =================================================
   * =              Submissão do Login               =
   * =================================================
   * Executa autenticação e redireciona para
   * o dashboard em caso de sucesso.
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Email ou senha inválidos.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded"
        />

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
        >
          {isLoading ? 'Entrando...' : 'Login'}
        </button>
      </form>
    </div>
  )
}