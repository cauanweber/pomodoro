import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { useAuth } from '../context/AuthContext'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const idleApi = window as typeof window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number
      cancelIdleCallback?: (id: number) => void
    }

    const prefetch = () => {
      void import('./Login')
    }

    if (idleApi.requestIdleCallback) {
      const id = idleApi.requestIdleCallback(prefetch, { timeout: 1500 })
      return () => idleApi.cancelIdleCallback?.(id)
    }

    const timeout = window.setTimeout(prefetch, 300)
    return () => window.clearTimeout(timeout)
  }, [])

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
    <div
      className="register-scope relative min-h-screen w-full overflow-hidden flex items-center justify-center p-6"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            'radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.12) 40%, transparent 65%), radial-gradient(circle at 86% 82%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
            'radial-gradient(circle at 20% 22%, rgba(20, 184, 166, 0.2) 0%, rgba(6, 78, 59, 0.1) 40%, transparent 65%), radial-gradient(circle at 80% 78%, rgba(255, 255, 255, 0.06) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #10252a 55%, #20363c 100%)',
            'radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.12) 40%, transparent 65%), radial-gradient(circle at 86% 82%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
          ],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />

      <div
        className="absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />

      <motion.form
        onSubmit={handleRegister}
        className="relative w-full max-w-md rounded-3xl p-10 backdrop-blur-xl flex flex-col gap-5"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px -20px rgba(0, 0, 0, 0.35)',
        }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-100/90">
            Criar conta
          </h1>
          <p className="text-sm text-gray-300/70 mt-2">
            Comece sua jornada de foco agora mesmo.
          </p>
        </div>

        <div className={`input-shell ${email ? 'has-value' : ''}`}>
          <input
            type="email"
            placeholder=" "
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <label className="input-label">Email</label>
        </div>

        <div className={`input-shell ${password ? 'has-value' : ''}`}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder=" "
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="input-field input-with-action"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="input-action"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <label className="input-label">Senha</label>
        </div>

        {error && (
          <p className="text-sm text-red-400/90 text-center">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          className="relative px-6 py-3 rounded-2xl font-medium overflow-hidden disabled:opacity-60"
          style={{
            background:
              'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.25) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className="relative z-10">
            {isLoading ? 'Criando conta...' : 'Registrar'}
          </span>
        </motion.button>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-300/70">
          <span>Já tem uma conta?</span>
          <motion.div
            className="relative font-medium"
            style={{
              color: 'rgba(16, 185, 129, 0.9)',
            }}
            whileHover={{
              color: 'rgba(16, 185, 129, 1)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="register-link relative">
              Fazer login
              <span className="link-underline" />
            </Link>
          </motion.div>
        </div>
      </motion.form>

      <style>{`
        body {
          overflow: hidden;
        }

        .register-scope,
        .register-scope * {
          box-sizing: border-box;
        }

        .register-scope p,
        .register-scope h1 {
          margin: 0;
        }

        .register-scope::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .input-shell {
          position: relative;
          padding: 2px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: border-color 0.3s ease;
        }

        .input-shell:focus-within {
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
        }

        .input-field {
          width: 100%;
          padding: 16px 16px 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          outline: none;
        }

        .input-with-action {
          padding-right: 44px;
        }

        .input-action {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          color: rgba(199, 220, 214, 0.7);
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .input-action:hover {
          color: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
        }

        .input-field::placeholder {
          color: transparent;
        }

        .input-label {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          padding: 0 6px;
          color: rgba(199, 220, 214, 0.7);
          font-size: 12px;
          border-radius: 999px;
          transition: all 0.2s ease-out;
          pointer-events: none;
          z-index: 1;
          background: rgba(10, 28, 26, 0.2);
          text-shadow: 0 0 4px rgba(10, 28, 26, 0.8);
        }

        .input-shell:focus-within .input-label,
        .input-shell.has-value .input-label,
        .input-field:not(:placeholder-shown) + .input-label,
        .input-field:valid + .input-label {
          top: 0;
          transform: translateY(-50%);
          color: rgba(16, 185, 129, 0.9);
        }

        .link-underline {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 1px;
          background: rgba(16, 185, 129, 0.6);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s ease;
        }

        .register-link:hover .link-underline {
          transform: scaleX(1);
        }

        .register-link {
          color: inherit;
          text-decoration: none;
        }

        .register-link:visited {
          color: inherit;
        }

        @media (prefers-reduced-motion: reduce) {
          .register-scope * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}
