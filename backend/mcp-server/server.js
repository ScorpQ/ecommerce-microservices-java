import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import axios from "axios";
import { z } from "zod";

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://13.60.44.13:8085/api/product";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

function createMcpServer() {
  const server = new McpServer({
    name: "n11-product-server",
    version: "1.0.0",
  });

  server.tool(
    "search_products",
    "Ürünleri kategori, marka, renk veya maksimum fiyata göre arar ve listeler",
    {
      category: z.string().optional().describe("Ürün kategorisi (örn: Elektronik, Giyim, Oyuncak)"),
      brand: z.string().optional().describe("Marka adı (örn: Nike, Apple, Samsung)"),
      color: z.string().optional().describe("Renk (örn: Siyah, Beyaz, Kırmızı)"),
      maxPrice: z.number().optional().describe("Maksimum fiyat (TL)"),
    },
    async ({ category, brand, color, maxPrice }) => {
      try {
        const response = await axios.get(PRODUCT_SERVICE_URL);
        let products = response.data;

        if (category) {
          products = products.filter(p =>
            p.category?.toLowerCase().includes(category.toLowerCase())
          );
        }
        if (brand) {
          products = products.filter(p =>
            p.brand?.toLowerCase().includes(brand.toLowerCase())
          );
        }
        if (color) {
          products = products.filter(p =>
            p.color?.toLowerCase().includes(color.toLowerCase())
          );
        }
        if (maxPrice !== undefined) {
          products = products.filter(p => p.price <= maxPrice);
        }

        if (products.length === 0) {
          return { content: [{ type: "text", text: "Arama kriterlerine uygun ürün bulunamadı." }] };
        }

        const result = products.map(p =>
          `ID: ${p.id} | ${p.title} | Marka: ${p.brand} | Renk: ${p.color} | Fiyat: ${p.price} TL | Kategori: ${p.category}`
        ).join("\n");

        return { content: [{ type: "text", text: `${products.length} ürün bulundu:\n\n${result}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Hata: ${error.message}` }] };
      }
    }
  );

  server.tool(
    "get_product",
    "ID'ye göre tek bir ürünün detaylarını getirir",
    {
      id: z.string().describe("Ürün ID'si (sayı olarak girin, örn: 57)"),
    },
    async ({ id }) => {
      try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/${id}`);
        const p = response.data;

        const result = `ID: ${p.id}
Başlık: ${p.title}
Marka: ${p.brand}
Kategori: ${p.category}
Renk: ${p.color}
Fiyat: ${p.price} TL
Açıklama: ${p.description}
Etiketler: ${p.labels}
Resim: ${p.img || "Yok"}`;

        return { content: [{ type: "text", text: result }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Ürün bulunamadı: ${error.message}` }] };
      }
    }
  );

  server.tool(
    "get_paged_products",
    "Ürünleri sayfalı olarak listeler",
    {
      page: z.union([z.number(), z.string()]).transform(val => Number(val)).default(0).describe("Sayfa numarası (0'dan başlar)"),
      size: z.union([z.number(), z.string()]).transform(val => Number(val)).default(4).describe("Sayfa başına ürün sayısı"),
    },
    async ({ page, size }) => {
      try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/paged`, {
          params: { page, size },
        });
        const data = response.data;

        const result = data.items.map(p =>
          `ID: ${p.id} | ${p.title} | ${p.brand} | ${p.price} TL`
        ).join("\n");

        return {
          content: [{
            type: "text",
            text: `Sayfa ${data.page + 1}/${data.totalPages} (Toplam ${data.totalElements} ürün):\n\n${result}`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Hata: ${error.message}` }] };
      }
    }
  );

  return server;
}

const transports = new Map();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const server = createMcpServer();
  transports.set(transport.sessionId, { transport, server });

  res.on("close", () => {
    transports.delete(transport.sessionId);
  });

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const entry = transports.get(sessionId);

  if (!entry) {
    return res.status(400).json({ error: "Session not found" });
  }

  await entry.transport.handlePostMessage(req, res);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});
