import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleLogin() {
    login('fake-token', { id: '1', email: 'test@test.com' })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Login
      </button>
    </div>
  )
}