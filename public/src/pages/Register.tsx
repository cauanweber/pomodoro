import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister() {
    try {
      await register(email, password)
      navigate('/dashboard')
    } catch {
      alert('Erro ao registrar')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-2 border rounded"
      />
      <button
        onClick={handleRegister}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Registrar
      </button>
    </div>
  )
}