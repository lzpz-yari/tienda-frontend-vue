// Punto de entrada del frontend: crea la app de Vue, le conecta el router y la monta en <div id="app">
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')