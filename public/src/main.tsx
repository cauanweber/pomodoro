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
 * Dependências essenciais para inicialização do React.
 * Responsáveis por criar e montar a raiz da aplicação.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'

/**
 * =====================================================
 * =           Contextos Globais da Aplicação          =
 * =====================================================
 * Providers que controlam estado global da aplicação.
 * Envolvem toda a árvore de componentes.
 */

import { AuthProvider } from './context/AuthContext'

/**
 * =====================================================
 * =                 Estilos Globais                   =
 * =====================================================
 * Estilos base e visuais compartilhados da aplicação.
 * Aplicados globalmente antes da renderização da UI.
 */

import './styles/global.css'
import './styles/index.css'
import './styles/background.css'
import './styles/timer-card.css'
import './styles/controls.css'
import './styles/history.css'
import './styles/animations.css'

/**
 * =====================================================
 * =              Componente Raiz da UI                =
 * =====================================================
 * Componente principal da aplicação React.
 * Define a estrutura base da interface.
 */

import App from './App'

/**
 * =====================================================
 * =               Renderização da UI                  =
 * =====================================================
 * Cria a raiz do React e monta a árvore de componentes.
 * Envolve o App com os Providers globais necessários.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)