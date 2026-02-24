# 🛒 Laburen MCP – API de Carrito de Compras - ESPAÑOL

Este proyecto implementa una **API REST** desarrollada con **Cloudflare Workers** y **Cloudflare D1** como parte de una prueba técnica.

La API simula el backend de un sistema de **carrito de compras conversacional**, diseñado para ser consumido por un **agente de IA**.  
Permite explorar productos, calcular precios por escala, gestionar un carrito persistente por sesión y finalizar un pedido (checkout simulado).

---

## 🛠 Tecnologías utilizadas

- ☁️ Cloudflare Workers  
- 🗄 Cloudflare D1 (SQLite)  
- 🟨 JavaScript  
- 🔌 API REST  

---

## 🚀 Funcionalidades principales

### 📦 Productos

- 📋 Listado de productos disponibles  
- 🔎 Búsqueda flexible por tipo, talle y color  
- 🔤 Normalización de texto:
  - singular y plural  
  - sinónimos (ej: remera / camiseta)  
  - variaciones de color y talle  
- 💲 Información de precios por escala (50 / 100 / 200 unidades)  

---

### 🛒 Carrito de compras

- 🧾 Un solo carrito por sesión  
- 🔄 Persistencia del carrito durante toda la conversación  
- ➕ Agregar productos al carrito  
- ✏️ Actualizar cantidades  
- ❌ Eliminar productos cuando la cantidad llega a 0  
- 🧮 Cálculo de subtotales y total  
- ✅ Validación de disponibilidad de productos  

---

### 💰 Cálculo de precios

- 📊 Cálculo informativo según la cantidad solicitada  
- 📈 Aplicación automática de la escala correcta (≥50, ≥100, ≥200)  
- ⚠️ El cálculo **no modifica el carrito**  
- 🛍 El producto solo se agrega si el usuario lo solicita explícitamente  

---

### 🧾 Checkout

- 🔁 Flujo de checkout simulado  
- 🚫 No procesa pagos reales  
- 📦 No descuenta stock  
- 🤖 Representa el cierre del flujo conversacional  

---

## 🧠 Manejo de sesión

- 🆔 El carrito se identifica mediante el encabezado `X-Session-Id`  
- Cada conversación mantiene:
  - una única sesión  
  - un único carrito  
- 🔒 No se crean carritos adicionales mientras dure la sesión  

---

## 📡 Endpoints

Los endpoints disponibles y su comportamiento se encuentran documentados directamente en el archivo del proyecto.



# 🛒 Laburen MCP – Shopping Cart API - ENGLISH

This project implements a **REST API** built with **Cloudflare Workers** and **Cloudflare D1** as part of a technical challenge.

The API simulates the backend of a **conversational shopping cart system**, designed to be consumed by an **AI agent**.  
It allows product exploration, tier-based price calculation, session-based cart persistence, and a simulated checkout flow.

---

## 🛠 Technologies Used

- ☁️ Cloudflare Workers  
- 🗄 Cloudflare D1 (SQLite)  
- 🟨 JavaScript  
- 🔌 REST API  

---

## 🚀 Core Features

### 📦 Products

- 📋 Product listing  
- 🔎 Flexible search by type, size, and color  
- 🔤 Text normalization:
  - singular and plural forms  
  - synonyms (e.g., t-shirt / shirt)  
  - size and color variations  
- 💲 Tier-based pricing (50 / 100 / 200 units)  

---

### 🛒 Shopping Cart

- 🧾 Single cart per session  
- 🔄 Persistent cart during the entire conversation  
- ➕ Add products to cart  
- ✏️ Update quantities  
- ❌ Remove products when quantity reaches 0  
- 🧮 Subtotal and total calculation  
- ✅ Product availability validation  

---

### 💰 Price Calculation

- 📊 Informational price calculation based on requested quantity  
- 📈 Automatic application of correct pricing tier (≥50, ≥100, ≥200)  
- ⚠️ Price calculation **does not modify the cart**  
- 🛍 Products are only added when explicitly requested  

---

### 🧾 Checkout

- 🔁 Simulated checkout flow  
- 🚫 No real payment processing  
- 📦 No stock deduction  
- 🤖 Represents the end of the conversational flow  

---

## 🧠 Session Management

- 🆔 Cart identified through `X-Session-Id` header  
- Each conversation maintains:
  - a single session  
  - a single cart  
- 🔒 No additional carts are created during the session  

---

## 📡 Endpoints

Available endpoints and their behavior are documented directly within the project files.




