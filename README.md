# Laburen MCP – API de carrito de compras

Este proyecto implementa una **API REST** desarrollada con **Cloudflare Workers** y **Cloudflare D1** como parte de una prueba técnica.

La API simula el backend de un sistema de carrito de compras pensado para ser consumido por un **agente IA**, permitiendo listar productos, gestionar un carrito y realizar un checkout.

---

## Tecnologías utilizadas

- Cloudflare Workers
- Cloudflare D1 (SQLite)
- JavaScript 
- API REST

---

## Funcionalidades principales

### Productos
- Listado de productos disponibles
- Información de stock y precios

### Carrito de compras
- Creación de carrito
- Agregar productos
- Sumar y restar cantidades
- Eliminar productos cuando la cantidad llega a 0
- Persistencia del estado del carrito
- Validación de stock disponible

### Checkout
- Endpoint de checkout **mock**
- No procesa pagos reales
- No descuenta stock (simulación de flujo real)

---

## Endpoints
- Los endpoints disponibles y su lógica se encuentran documentados directamente en el archivo src/worker.js


