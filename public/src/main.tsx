/**
 * =====================================================
 * =            Bootstrap da Aplicação React           =
 * =====================================================
 *
 * Ponto de entrada principal da aplicação.
 * Responsável por:
 * - Inicializar o React
 * - Montar a árvore de Providers globais
 * - Aplicar estilos globais
 * - Renderizar o componente raiz (<App />)
 */

/**
 * =====================================================
 * =                Bibliotecas Core                   =
 * =====================================================
 *
 * Dependências principais do React e do DOM.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'

/**
 * =====================================================
 * =           Contextos Globais da Aplicação          =
 * =====================================================
 *
 * Providers responsáveis por estado global
 * e regras transversais (ex: autenticação).
 */

import { AuthProvider } from './context/AuthContext'

/**
 * =====================================================
 * =                 Estilos Globais                   =
 * =====================================================
 *
 * CSS base e estilos compartilhados
 * entre múltiplos componentes.
 */

import './styles/global.css'
import './styles/index.css'

/**
 * =====================================================
 * =              Componente Raiz da UI                =
 * =====================================================
 *
 * Componente principal da aplicação.
 */

import App from './App'

/**
 * =====================================================
 * =               Renderização da UI                  =
 * =====================================================
 *
 * Cria a raiz do React e monta
 * a árvore de Providers globais.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
