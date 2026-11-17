// Funciones que llaman a los endpoints del MÓDULO PRODUCTOS (/api/productos)
import api from './api'

export default {
  listar() {
    return api.get('/productos')                    // GET    /api/productos
  },
  obtener(id) {
    return api.get(`/productos/${id}`)              // GET    /api/productos/{id}
  },
  crear(producto) {
    return api.post('/productos', producto)         // POST   /api/productos
  },
  actualizar(id, producto) {
    return api.put(`/productos/${id}`, producto)    // PUT    /api/productos/{id}
  },
  eliminar(id) {
    return api.delete(`/productos/${id}`)           // DELETE /api/productos/{id}
  },
}