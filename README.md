# Laburen MCP – API de carrito de compras

Este proyecto implementa una **API REST** desarrollada con **Cloudflare Workers** y **Cloudflare D1** como parte de una prueba técnica.

La API simula el backend de un sistema de **carrito de compras conversacional**, diseñado para ser consumido por un **agente de IA**.  
Permite explorar productos, calcular precios por escala, gestionar un carrito persistente por sesión y finalizar un pedido (checkout simulado).

---

## Tecnologías utilizadas

- Cloudflare Workers
- Cloudflare D1 (SQLite)
- JavaScript
- API REST

---

## Funcionalidades principales

###  Productos
- Listado de productos disponibles
- Búsqueda flexible por tipo, talle y color
- Normalización de texto:
  - singular y plural
  - sinónimos (ej: remera / camiseta)
  - variaciones de color y talle
- Información de precios por escala (50 / 100 / 200 unidades)

---

###  Carrito de compras
- Un solo carrito por sesión
- Persistencia del carrito durante toda la conversación
- Agregar productos al carrito
- Actualizar cantidades
- Eliminar productos cuando la cantidad llega a 0
- Cálculo de subtotales y total
- Validación de disponibilidad de productos

---

###  Cálculo de precios
- Cálculo informativo de precios según la cantidad solicitada
- Aplicación automática de la escala correcta (≥50, ≥100, ≥200)
- El cálculo **no modifica el carrito**
- El producto solo se agrega si el usuario lo solicita explícitamente

---

###  Checkout
- Flujo de checkout simulado
- No procesa pagos reales
- No descuenta stock
- Representa el cierre del flujo conversacional

---

## Manejo de sesión

- El carrito se identifica mediante un encabezado `X-Session-Id`
- Cada conversación mantiene:
  - una única sesión
  - un único carrito
- No se crean carritos adicionales mientras dure la sesión

---

## Endpoints

Los endpoints disponibles y su comportamiento se encuentran documentados directamente en el archivo:




