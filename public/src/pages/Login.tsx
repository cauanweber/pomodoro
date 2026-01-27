import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Falha no login')
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
        onClick={handleLogin}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Login
      </button>
    </div>
  )
}