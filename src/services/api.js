// Configuración ÚNICA de axios para hablar con el microservicio de Spring Boot.
// La URL base se toma del archivo .env  ->  VITE_API_URL=http://localhost:8080/api
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Convierte cualquier error de axios en un mensaje entendible.
 * El backend responde errores con este formato (ErrorResponseDTO):
 *   { status, error, mensaje, detalles: { campo: "mensaje" } }
 */
export function obtenerMensajeError(error) {
  if (!error.response) {
    return 'No se pudo conectar con el backend. ¿Está corriendo en http://localhost:8080?'
  }
  const data = error.response.data || {}
  if (data.detalles) {
    return Object.values(data.detalles).join(' | ')   // errores de validación
  }
  return data.mensaje || data.error || `Error ${error.response.status}`
}

export default api