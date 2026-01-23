export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Endpoint de salud (para tests)
    if (pathname === "/health") {
      return jsonResponse({
        status: "ok",
        service: "laburen-mcp",
      });
    }

    // Listar productos (mock por ahora)
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

    // Ruta no encontrada
    return jsonResponse(
      { error: "Not found" },
      404
    );
  },
};

// Helper para responder JSON
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
