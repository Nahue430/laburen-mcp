// Almacenamiento en memoria (mock)
const carts = {};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =========================
    // Health check
    // =========================
    if (pathname === "/health") {
      return jsonResponse({
        status: "ok",
        service: "laburen-mcp",
      });
    }

    // =========================
    // Listar productos
    // =========================
    if (pathname === "/products" && request.method === "GET") {
      return jsonResponse({
        products: [
          {
            id: "001",
            name: "Pantalón",
            size: "XXL",
            color: "Verde",
            price: 1058,
            stock: 177,
          },
          {
            id: "002",
            name: "Camiseta",
            size: "XL",
            color: "Blanco",
            price: 510,
            stock: 33,
          },
        ],
      });
    }

    // =========================
    // Crear carrito
    // =========================
    if (pathname === "/cart" && request.method === "POST") {
      const cartId = crypto.randomUUID();

      carts[cartId] = {
        id: cartId,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return jsonResponse(
        {
          cart_id: cartId,
          message: "Cart created successfully",
        },
        201
      );
    }

    // =========================
    // Actualizar carrito
    // =========================
    if (pathname.startsWith("/cart/") && request.method === "PUT") {
      const cartId = pathname.split("/")[2];

      if (!carts[cartId]) {
        return jsonResponse({ error: "Cart not found" }, 404);
      }

      const body = await request.json();
      const { product_id, qty } = body;

      if (!product_id || !qty) {
        return jsonResponse(
          { error: "product_id and qty are required" },
          400
        );
      }

      carts[cartId].items.push({
        product_id,
        qty,
      });

      carts[cartId].updated_at = new Date().toISOString();

      return jsonResponse({
        message: "Cart updated successfully",
        cart: carts[cartId],
      });
    }

    // =========================
    // Not found
    // =========================
    return jsonResponse({ error: "Not found" }, 404);
  },
};

// Helper JSON
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
