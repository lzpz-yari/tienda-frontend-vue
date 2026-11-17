// Funciones que llaman a los endpoints del MÓDULO VENTAS (/api/ventas)
import api from './api'

export default {
  listar() {
    return api.get('/ventas')                 // GET    /api/ventas
  },
  obtener(id) {
    return api.get(`/ventas/${id}`)           // GET    /api/ventas/{id}
  },
  registrar(venta) {
    // venta = { cliente: 'Juan', detalles: [ { productoId: 1, cantidad: 2 } ] }
    return api.post('/ventas', venta)         // POST   /api/ventas
  },
  cancelar(id) {
    return api.delete(`/ventas/${id}`)        // DELETE /api/ventas/{id}
  },
}