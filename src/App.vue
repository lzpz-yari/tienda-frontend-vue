<!-- Componente raíz: barra de navegación + el espacio donde se muestra cada vista (router-view) -->
<template>
  <header class="barra">
    <div class="contenedor barra__contenido">
      <h1 class="barra__titulo">Tienda</h1>
      <nav class="barra__nav">
        <RouterLink to="/productos">Productos</RouterLink>
        <RouterLink to="/ventas">Ventas</RouterLink>
      </nav>
    </div>
  </header>

  <main class="contenedor">
    <RouterView />
  </main>
</template>