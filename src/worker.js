// =========================
// Worker API - laburen-mcp
// =========================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =========================
    // Health check
    // =========================
    if (pathname === "/health" && request.method === "GET") {
      return jsonResponse({
        status: "ok",
        service: "laburen-mcp",
      });
    }

    // =========================
    // Listar productos
    // =========================
    if (pathname === "/products" && request.method === "GET") {
      try {
        const { results } = await env.DB
          .prepare("SELECT * FROM products")
          .all();

        return jsonResponse({
          count: results.length,
          products: results,
        });
      } catch (error) {
        return jsonResponse(
          { error: "Error fetching products", details: error.message },
          500
        );
      }
    }

    // =========================
    // Crear carrito
    // =========================
    if (pathname === "/cart" && request.method === "POST") {
      const cartId = crypto.randomUUID();
      const now = new Date().toISOString();

      try {
        await env.DB.prepare(
          `INSERT INTO carts (id, created_at, updated_at)
           VALUES (?, ?, ?)`
        )
          .bind(cartId, now, now)
          .run();

        return jsonResponse(
          {
            cart_id: cartId,
            message: "Cart created successfully",
          },
          201
        );
      } catch (error) {
        return jsonResponse(
          { error: "Error creating cart", details: error.message },
          500
        );
      }
    }

    // =========================
    // Ver carrito (GET /cart/:id)
    // =========================
    if (pathname.startsWith("/cart/") && request.method === "GET") {
      const cartId = pathname.split("/")[2];

      if (!cartId) {
        return jsonResponse({ error: "cartId is required" }, 400);
      }

      const items = await env.DB.prepare(
        `
        SELECT
          ci.product_id,
          p.product_type,
          p.size,
          p.color,
          ci.quantity,
          p.stock,
          p.price_50_u
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.cart_id = ?
        `
      )
        .bind(cartId)
        .all();

      const totalItems = items.results.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      return jsonResponse({
        cart_id: cartId,
        items: items.results,
        total_items: totalItems,
      });
    }

    // =========================
    // Agregar / modificar / eliminar item del carrito
    // (PUT /cart/:id)
    // =========================
    if (pathname.startsWith("/cart/") && request.method === "PUT") {
      const cartId = pathname.split("/")[2];

      if (!cartId) {
        return jsonResponse({ error: "cartId is required" }, 400);
      }

      const cart = await env.DB
        .prepare("SELECT id FROM carts WHERE id = ?")
        .bind(cartId)
        .first();

      if (!cart) {
        return jsonResponse({ error: "Cart not found" }, 404);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
      }

      const { product_id, quantity } = body;

      if (!product_id || typeof quantity !== "number") {
        return jsonResponse(
          { error: "product_id and quantity are required" },
          400
        );
      }

      const product = await env.DB
        .prepare("SELECT id, stock FROM products WHERE id = ?")
        .bind(product_id)
        .first();

      if (!product) {
        return jsonResponse({ error: "Product not found" }, 404);
      }

      const existingItem = await env.DB.prepare(
        `SELECT id, quantity FROM cart_items
         WHERE cart_id = ? AND product_id = ?`
      )
        .bind(cartId, product_id)
        .first();

      const currentQty = existingItem ? existingItem.quantity : 0;
      const newQty = currentQty + quantity;

      // No permitir cantidades finales negativas
      if (newQty < 0) {
        return jsonResponse(
          { error: "Quantity cannot be negative" },
          400
        );
      }

      // Validar stock
      if (newQty > product.stock) {
        return jsonResponse(
          {
            error: "Not enough stock available",
            available_stock: product.stock,
            requested_total: newQty,
          },
          400
        );
      }

      // Si llega a 0 → eliminar item
      if (newQty === 0 && existingItem) {
        await env.DB.prepare(
          `DELETE FROM cart_items WHERE id = ?`
        )
          .bind(existingItem.id)
          .run();

        await env.DB.prepare(
          `UPDATE carts SET updated_at = ? WHERE id = ?`
        )
          .bind(new Date().toISOString(), cartId)
          .run();

        return jsonResponse({
          message: "Item removed from cart",
          product_id,
          quantity: 0,
        });
      }

      // Insertar o actualizar
      if (existingItem) {
        await env.DB.prepare(
          `UPDATE cart_items SET quantity = ? WHERE id = ?`
        )
          .bind(newQty, existingItem.id)
          .run();
      } else {
        await env.DB.prepare(
          `INSERT INTO cart_items (cart_id, product_id, quantity)
           VALUES (?, ?, ?)`
        )
          .bind(cartId, product_id, newQty)
          .run();
      }

      await env.DB.prepare(
        `UPDATE carts SET updated_at = ? WHERE id = ?`
      )
        .bind(new Date().toISOString(), cartId)
        .run();

      return jsonResponse({
        message: "Cart updated successfully",
        product_id,
        quantity: newQty,
      });
    }

    // =========================
    // Checkout mock
    // (POST /cart/:id/checkout)
    // =========================
    if (pathname.endsWith("/checkout") && request.method === "POST") {
      const cartId = pathname.split("/")[2];

      return jsonResponse({
        cart_id: cartId,
        status: "pending_payment",
        message:
          "Checkout initiated. Stock will be discounted after payment confirmation.",
      });
    }

    // =========================
    // Not found
    // =========================
    return jsonResponse({ error: "Not found" }, 404);
  },
};

// =========================
// Helper JSON
// =========================
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
