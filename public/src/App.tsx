/**
 * =====================================================
 * =              Composição de Rotas da UI             =
 * =====================================================
 *
 * Define as rotas principais da aplicação.
 * Responsável por:
 * - Declarar rotas públicas e protegidas
 * - Integrar o sistema de autenticação
 * - Compor a navegação da aplicação
 */

/**
 * =====================================================
 * =               Bibliotecas Core                    =
 * =====================================================
 * Componentes do React Router para navegação
 * e controle de rotas da aplicação.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'

/**
 * =====================================================
 * =                 Páginas da UI                     =
 * =====================================================
 * Páginas principais acessadas via rotas
 * públicas e autenticadas.
 */

import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'

/**
 * =====================================================
 * =            Componentes de Segurança               =
 * =====================================================
 * Wrapper responsável por proteger rotas
 * que exigem autenticação.
 */

import { ProtectedRoute } from './components/ProtectedRoute'

/**
 * =====================================================
 * =              Componente App                       =
 * =====================================================
 * Componente raiz responsável por montar
 * a árvore de rotas da aplicação.
 */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App