/**
 * =====================================================
 * =              Cliente HTTP da Aplicação            =
 * =====================================================
 *
 * Configura o cliente Axios usado em toda a aplicação.
 * Responsável por:
 * - Definir a URL base da API
 * - Injetar o token JWT automaticamente
 * - Centralizar regras de comunicação HTTP
 */

/**
 * =====================================================
 * =               Bibliotecas Core                    =
 * =====================================================
 * Axios utilizado como cliente HTTP padrão
 * para comunicação com o backend.
 */

import axios from 'axios'

/**
 * =====================================================
 * =             Configurações da API                  =
 * =====================================================
 * Instância do Axios com URL base definida
 * a partir das variáveis de ambiente.
 */

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

/**
 * =====================================================
 * =          Interceptor de Autenticação              =
 * =====================================================
 * Injeta automaticamente o token JWT no header
 * Authorization de todas as requisições.
 */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})