# tienda-frontend-vue

Frontend en **Vue 3 + Vite** que consume el microservicio `tienda-backend-springboot`
(módulos Productos y Ventas).

## Requisitos
- Node.js 20 o superior
- El backend corriendo en http://localhost:8080

## Cómo ejecutarlo
```bash
npm install        # solo la primera vez (descarga dependencias)
npm run dev        # abre http://localhost:5173
```

Si el backend corre en otra dirección, cambia `VITE_API_URL` en el archivo `.env`.

## Estructura
```
src/
├── main.js                 -> arranca Vue y el router
├── App.vue                 -> barra de navegación + <RouterView>
├── router/index.js         -> rutas /productos y /ventas
├── services/
│   ├── api.js              -> axios con la URL del backend + mensajes de error
│   ├── productoService.js  -> llamadas a /api/productos
│   └── ventaService.js     -> llamadas a /api/ventas
├── views/
│   ├── ProductosView.vue   -> CRUD de productos
│   └── VentasView.vue      -> carrito, registrar venta, historial, cancelar
└── style.css               -> estilos
```