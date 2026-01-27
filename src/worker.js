// =========================
// Worker API - laburen-mcp
// =========================


//Mapa de sinonimos para productos: permite interpretar distintas formas de referirse a un mismo producto
const SYNONYMS_MAP = {
  camiseta: ["camiseta", "camisetas", "remera", "remeras", "playera", "playeras"],
  pantalon: ["pantalon", "pantalones", "pantalón", "jean", "jeans"],
  falda: ["falda", "faldas", "pollera", "polleras"],
  sudadera: ["sudadera", "sudaderas", "buzo", "buzos", "hoodie", "hoodies"],
  chaqueta: ["chaqueta", "chaquetas", "campera", "camperas", "abrigo"]
};

// =========================
// Normalización base
// =========================
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// =========================
// Normalizar tipo (singular/plural/sinónimos)
// =========================
function normalizeProductType(text) {
  const t = normalizeText(text);
  for (const key in SYNONYMS_MAP) {
    for (const v of SYNONYMS_MAP[key]) {
      if (t.includes(v)) return key;
    }
  }
  return null;
}

// =========================
// Normalizar color (masc/fem/plural)
// =========================
function normalizeColor(text) {
  const t = normalizeText(text);

  if (t.includes("negr")) return "negro";
  if (t.includes("blanc")) return "blanco";
  if (t.includes("roj")) return "rojo";
  if (t.includes("azul")) return "azul";
  if (t.includes("verd")) return "verde";
  if (t.includes("gris")) return "gris";

  return null;
}

// =========================
// Normalizar talle
// =========================
function normalizeSize(text) {
  const t = normalizeText(text);

  if (t.includes("xxl")) return "xxl";
  if (t.includes("xl")) return "xl";
  if (t.includes(" l ")) return "l";
  if (t.endsWith(" l")) return "l";
  if (t.includes(" m ")) return "m";
  if (t.endsWith(" m")) return "m";
  if (t.includes(" s ")) return "s";
  if (t.endsWith(" s")) return "s";

  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "");

    await env.DB.prepare("PRAGMA foreign_keys = ON;").run();

    // =========================
    // SESSION PARA CART
    // =========================
    const sessionId = request.headers.get("X-Session-Id");
    const requiresSession = pathname.startsWith("/cart");

    if (requiresSession) {
      if (!sessionId || sessionId.includes("{{")) {
        return jsonResponse(
          { error: "Missing or invalid X-Session-Id" },
          400
        );
      }
    }

    // =========================
    // Health: VERIFICAR SI EL WORKER ESTA ACTIVO Y FUNCIONANDO
    // =========================
    if (pathname === "/health" && request.method === "GET") {
      return jsonResponse({ status: "ok", service: "laburen-mcp" });
    }

    // =========================
    // Products SIN SESSION
    // =========================
    if (pathname === "/products" && request.method === "GET") {
      const { results } = await env.DB
        .prepare(`
          SELECT
            id,
            product_type,
            description,
            size,
            color,
            price_50_u,
            price_100_u,
            price_200_u,
            available
          FROM products
          LIMIT 30
        `)
        .all();

      return jsonResponse({ products: results });
    }

    // =========================
    // Products Search BUSQUEDA DE PRODUCTOS
    // =========================
    if (pathname === "/products/search" && request.method === "GET") {
      const rawQ = url.searchParams.get("q");
      if (!rawQ) return jsonResponse({ results: [] });

      const text = normalizeText(rawQ);

      const type = normalizeProductType(text);
      const color = normalizeColor(text);
      const size = normalizeSize(text);

      const { results } = await env.DB
        .prepare(`
          SELECT
            id AS product_id,
            product_type,
            description,
            size,
            color,
            price_50_u,
            price_100_u,
            price_200_u,
            available,
            stock
          FROM products
          WHERE LOWER(product_type) LIKE ?
            AND LOWER(color) LIKE ?
            AND LOWER(size) LIKE ?
          LIMIT 30
        `)
        .bind(
          type ? `%${type}%` : `%`,
          color ? `%${color}%` : `%`,
          size ? `%${size}%` : `%`
        )
        .all();

      return jsonResponse({ results });
    }

    // =========================
    // GET CART
    // =========================
    if (pathname === "/cart" && request.method === "GET") {
      const cart = await env.DB
        .prepare("SELECT id FROM carts WHERE session_id = ?")
        .bind(sessionId)
        .first();

      if (!cart) {
        return jsonResponse({
          items: [],
          total_items: 0,
          total_price: 0
        });
      }

      const { results } = await env.DB
        .prepare(`
          SELECT
            p.product_type,
            p.size,
            p.color,
            ci.quantity,
            p.price_50_u
          FROM cart_items ci
          JOIN products p ON p.id = ci.product_id
          WHERE ci.cart_id = ?
        `)
        .bind(cart.id)
        .all();

      const items = results.map(i => ({
        ...i,
        subtotal: i.quantity * i.price_50_u
      }));

      return jsonResponse({
        items,
        total_items: items.reduce((a, i) => a + i.quantity, 0),
        total_price: items.reduce((a, i) => a + i.subtotal, 0)
      });
    }

    // =========================
    // PUT CART
    // =========================
    if (pathname === "/cart" && request.method === "PUT") {
      const body = await request.json();
      const quantity = Number(body.quantity);

      if (!body.product_id || !Number.isFinite(quantity) || quantity < 0) {
        return jsonResponse({ error: "invalid payload" }, 400);
      }

      const product = await env.DB
        .prepare("SELECT id, available FROM products WHERE id = ?")
        .bind(body.product_id)
        .first();

      if (!product || !product.available) {
        return jsonResponse({ error: "product not available" }, 400);
      }

      let cart = await env.DB
        .prepare("SELECT id FROM carts WHERE session_id = ?")
        .bind(sessionId)
        .first();

      if (!cart) {
        const now = new Date().toISOString();
        await env.DB
          .prepare(`
            INSERT INTO carts (session_id, created_at, updated_at)
            VALUES (?, ?, ?)
          `)
          .bind(sessionId, now, now)
          .run();

        cart = await env.DB
          .prepare("SELECT id FROM carts WHERE session_id = ?")
          .bind(sessionId)
          .first();
      }

      const existing = await env.DB
        .prepare("SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ?")
        .bind(cart.id, body.product_id)
        .first();

      if (quantity === 0) {
        if (existing) {
          await env.DB
            .prepare("DELETE FROM cart_items WHERE id = ?")
            .bind(existing.id)
            .run();
        }
      } else if (existing) {
        await env.DB
          .prepare("UPDATE cart_items SET quantity = ? WHERE id = ?")
          .bind(quantity, existing.id)
          .run();
      } else {
        await env.DB
          .prepare(`
            INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES (?, ?, ?)
          `)
          .bind(cart.id, body.product_id, quantity)
          .run();
      }

      await env.DB
        .prepare("UPDATE carts SET updated_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), cart.id)
        .run();

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Not found" }, 404);
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
