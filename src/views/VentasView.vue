<!-- VISTA DEL MÓDULO VENTAS: armar una venta (carrito) + historial de ventas -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import productoService from '../services/productoService'
import ventaService from '../services/ventaService'
import { obtenerMensajeError } from '../services/api'

// ---------- Estado ----------
const productos = ref([])     // para el <select>
const ventas = ref([])        // historial
const cliente = ref('')
const carrito = ref([])       // [{ productoId, nombre, precio, cantidad }]
const productoSeleccionado = ref('')
const cantidad = ref(1)
const ventaAbierta = ref(null) // id de la venta cuyo detalle se muestra
const mensaje = ref('')
const error = ref('')

// Total estimado del carrito (el total REAL lo calcula el backend)
const totalCarrito = computed(() =>
  carrito.value.reduce((suma, item) => suma + item.precio * item.cantidad, 0)
)

// ---------- Funciones ----------
async function cargarDatos() {
  try {
    const [respProductos, respVentas] = await Promise.all([
      productoService.listar(),
      ventaService.listar(),
    ])
    productos.value = respProductos.data
    ventas.value = respVentas.data
  } catch (e) {
    error.value = obtenerMensajeError(e)
  }
}

function agregarAlCarrito() {
  limpiarMensajes()
  const producto = productos.value.find(p => p.id === Number(productoSeleccionado.value))
  if (!producto) {
    error.value = 'Selecciona un producto'
    return
  }
  if (!cantidad.value || cantidad.value < 1) {
    error.value = 'La cantidad debe ser mayor a 0'
    return
  }
  // Si ya estaba en el carrito, solo se suma la cantidad
  const existente = carrito.value.find(item => item.productoId === producto.id)
  if (existente) {
    existente.cantidad += Number(cantidad.value)
  } else {
    carrito.value.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      cantidad: Number(cantidad.value),
    })
  }
  productoSeleccionado.value = ''
  cantidad.value = 1
}

function quitarDelCarrito(index) {
  carrito.value.splice(index, 1)
}

async function registrarVenta() {
  limpiarMensajes()
  // Lo que se envía al backend (VentaRequestDTO)
  const venta = {
    cliente: cliente.value,
    detalles: carrito.value.map(item => ({ productoId: item.productoId, cantidad: item.cantidad })),
  }
  try {
    const respuesta = await ventaService.registrar(venta)
    mensaje.value = `Venta #${respuesta.data.id} registrada. Total: ${moneda(respuesta.data.total)}`
    cliente.value = ''
    carrito.value = []
    await cargarDatos()   // se recarga para ver el stock actualizado
  } catch (e) {
    error.value = obtenerMensajeError(e)
  }
}

async function cancelarVenta(venta) {
  if (!confirm(`¿Cancelar la venta #${venta.id}? El stock se devolverá al inventario.`)) return
  limpiarMensajes()
  try {
    await ventaService.cancelar(venta.id)
    mensaje.value = `Venta #${venta.id} cancelada`
    await cargarDatos()
  } catch (e) {
    error.value = obtenerMensajeError(e)
  }
}

function verDetalle(id) {
  ventaAbierta.value = ventaAbierta.value === id ? null : id
}

function limpiarMensajes() {
  mensaje.value = ''
  error.value = ''
}

function moneda(valor) {
  return Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function fecha(valor) {
  return new Date(valor).toLocaleString('es-MX')
}

onMounted(cargarDatos)
</script>

<template>
  <section class="tarjeta">
    <h2>Nueva venta</h2>

    <div class="formulario">
      <label class="formulario__ancho">
        Cliente
        <input v-model="cliente" type="text" placeholder="Nombre del cliente" />
      </label>
      <label>
        Producto
        <select v-model="productoSeleccionado">
          <option value="">-- Selecciona --</option>
          <option v-for="p in productos" :key="p.id" :value="p.id" :disabled="p.stock === 0">
            {{ p.nombre }} ({{ moneda(p.precio) }}) — stock: {{ p.stock }}
          </option>
        </select>
      </label>
      <label>
        Cantidad
        <input v-model.number="cantidad" type="number" min="1" />
      </label>
      <div class="formulario__acciones">
        <button type="button" class="btn" @click="agregarAlCarrito">Agregar</button>
      </div>
    </div>

    <table v-if="carrito.length" class="tabla">
      <thead>
        <tr>
          <th>Producto</th>
          <th class="num">Precio</th>
          <th class="num">Cantidad</th>
          <th class="num">Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in carrito" :key="item.productoId">
          <td>{{ item.nombre }}</td>
          <td class="num">{{ moneda(item.precio) }}</td>
          <td class="num">{{ item.cantidad }}</td>
          <td class="num">{{ moneda(item.precio * item.cantidad) }}</td>
          <td class="acciones">
            <button class="btn btn--chico btn--peligro" @click="quitarDelCarrito(i)">Quitar</button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="num"><strong>Total</strong></td>
          <td class="num"><strong>{{ moneda(totalCarrito) }}</strong></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <p v-else class="vacio">El carrito está vacío. Agrega productos para armar la venta.</p>

    <button class="btn btn--primario" :disabled="carrito.length === 0" @click="registrarVenta">
      Registrar venta
    </button>

    <p v-if="mensaje" class="alerta alerta--exito">{{ mensaje }}</p>
    <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  </section>

  <section class="tarjeta">
    <div class="tarjeta__encabezado">
      <h2>Historial de ventas</h2>
      <button class="btn" @click="cargarDatos">Recargar</button>
    </div>

    <p v-if="ventas.length === 0" class="vacio">Aún no hay ventas.</p>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th class="num">Productos</th>
          <th class="num">Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="v in ventas" :key="v.id">
          <tr>
            <td>{{ v.id }}</td>
            <td>{{ fecha(v.fecha) }}</td>
            <td>{{ v.cliente }}</td>
            <td class="num">{{ v.detalles.length }}</td>
            <td class="num">{{ moneda(v.total) }}</td>
            <td class="acciones">
              <button class="btn btn--chico" @click="verDetalle(v.id)">
                {{ ventaAbierta === v.id ? 'Ocultar' : 'Ver detalle' }}
              </button>
              <button class="btn btn--chico btn--peligro" @click="cancelarVenta(v)">Cancelar</button>
            </td>
          </tr>
          <tr v-if="ventaAbierta === v.id" class="detalle">
            <td colspan="6">
              <ul>
                <li v-for="(d, i) in v.detalles" :key="i">
                  {{ d.cantidad }} × {{ d.nombreProducto }} a {{ moneda(d.precioUnitario) }}
                  = <strong>{{ moneda(d.subtotal) }}</strong>
                </li>
              </ul>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>