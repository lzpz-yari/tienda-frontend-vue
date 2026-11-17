<!-- VISTA DEL MÓDULO PRODUCTOS: formulario (crear / editar) + tabla con el inventario -->
<script setup>
import { ref, reactive, onMounted } from 'vue'
import productoService from '../services/productoService'
import { obtenerMensajeError } from '../services/api'

// ---------- Estado (datos que usa la pantalla) ----------
const productos = ref([])            // lista que viene del backend
const cargando = ref(false)
const mensaje = ref('')              // mensaje verde (éxito)
const error = ref('')                // mensaje rojo (error)
const editandoId = ref(null)         // null = creando, número = editando ese id

const formulario = reactive({ nombre: '', precio: '', stock: '' })

// ---------- Funciones ----------
async function cargarProductos() {
  cargando.value = true
  try {
    const respuesta = await productoService.listar()
    productos.value = respuesta.data
  } catch (e) {
    error.value = obtenerMensajeError(e)
  } finally {
    cargando.value = false
  }
}

async function guardar() {
  limpiarMensajes()
  // Lo que se envía al backend (ProductoRequestDTO)
  const datos = {
    nombre: formulario.nombre,
    precio: aNumero(formulario.precio),
    stock: aNumero(formulario.stock),
  }
  try {
    if (editandoId.value === null) {
      await productoService.crear(datos)
      mensaje.value = 'Producto registrado correctamente'
    } else {
      await productoService.actualizar(editandoId.value, datos)
      mensaje.value = 'Producto actualizado correctamente'
    }
    cancelarEdicion()
    await cargarProductos()
  } catch (e) {
    error.value = obtenerMensajeError(e)
  }
}

function editar(producto) {
  limpiarMensajes()
  editandoId.value = producto.id
  formulario.nombre = producto.nombre
  formulario.precio = producto.precio
  formulario.stock = producto.stock
}

async function eliminar(producto) {
  if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return
  limpiarMensajes()
  try {
    await productoService.eliminar(producto.id)
    mensaje.value = 'Producto eliminado'
    await cargarProductos()
  } catch (e) {
    error.value = obtenerMensajeError(e)
  }
}

function cancelarEdicion() {
  editandoId.value = null
  formulario.nombre = ''
  formulario.precio = ''
  formulario.stock = ''
}

function limpiarMensajes() {
  mensaje.value = ''
  error.value = ''
}

// Campo vacío -> null (así el backend responde "es obligatorio")
function aNumero(valor) {
  return valor === '' || valor === null ? null : Number(valor)
}

function moneda(valor) {
  return Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

// Cuando la pantalla se abre, se cargan los productos
onMounted(cargarProductos)
</script>

<template>
  <section class="tarjeta">
    <h2>{{ editandoId === null ? 'Nuevo producto' : `Editando producto #${editandoId}` }}</h2>

    <form class="formulario" @submit.prevent="guardar">
      <label>
        Nombre
        <input v-model="formulario.nombre" type="text" placeholder="Ej. Teclado Mecánico RGB" />
      </label>
      <label>
        Precio
        <input v-model="formulario.precio" type="number" step="0.01" min="0" placeholder="0.00" />
      </label>
      <label>
        Stock
        <input v-model="formulario.stock" type="number" min="0" placeholder="0" />
      </label>
      <div class="formulario__acciones">
        <button type="submit" class="btn btn--primario">
          {{ editandoId === null ? 'Guardar' : 'Actualizar' }}
        </button>
        <button v-if="editandoId !== null" type="button" class="btn" @click="cancelarEdicion">
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="mensaje" class="alerta alerta--exito">{{ mensaje }}</p>
    <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  </section>

  <section class="tarjeta">
    <div class="tarjeta__encabezado">
      <h2>Inventario</h2>
      <button class="btn" @click="cargarProductos">Recargar</button>
    </div>

    <p v-if="cargando">Cargando...</p>
    <p v-else-if="productos.length === 0" class="vacio">No hay productos registrados.</p>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th class="num">Precio</th>
          <th class="num">Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productos" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.nombre }}</td>
          <td class="num">{{ moneda(p.precio) }}</td>
          <td class="num" :class="{ 'stock-bajo': p.stock < 5 }">{{ p.stock }}</td>
          <td class="acciones">
            <button class="btn btn--chico" @click="editar(p)">Editar</button>
            <button class="btn btn--chico btn--peligro" @click="eliminar(p)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>