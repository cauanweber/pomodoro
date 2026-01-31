/**
 * =====================================================
 * =               Página de Registro                  =
 * =====================================================
 *
 * Tela responsável por criar uma nova conta.
 * Realiza o registro e autentica o usuário
 * automaticamente após sucesso.
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
 * Hook responsável por executar o registro
 * de novos usuários.
 */

import { useAuth } from '../context/AuthContext'

/**
 * =====================================================
 * =               Componente Register                 =
 * =====================================================
 * Controla o formulário de criação de conta
 * e executa o fluxo de registro.
 */

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * =================================================
   * =            Submissão do Registro               =
   * =================================================
   * Cria a conta e redireciona para o dashboard
   * em caso de sucesso.
   */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await register(email, password)
      navigate('/dashboard')
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleRegister}
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
          {isLoading ? 'Criando conta...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}