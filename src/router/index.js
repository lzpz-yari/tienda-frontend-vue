// RUTAS del frontend: qué pantalla (vista) se muestra según la URL del navegador
import { createRouter, createWebHistory } from 'vue-router'
import ProductosView from '../views/ProductosView.vue'
import VentasView from '../views/VentasView.vue'

const routes = [
  { path: '/', redirect: '/productos' },
  { path: '/productos', name: 'productos', component: ProductosView },
  { path: '/ventas', name: 'ventas', component: VentasView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})