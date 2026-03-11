import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-4051969126176591-091022-e005a2436640f2156d3b99f273b81e8d-47941751' 
});

// API Routes
app.post('/api/create-preference', async (req, res) => {
  try {
    const preference = new Preference(client);
    
    // Get the base URL for redirection
    // In production/preview, use the provided APP_URL env var or fallback to request origin
    const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'socialimob-pro',
            title: 'SocialImob Pro - Assinatura Mensal',
            quantity: 1,
            unit_price: 97,
            currency_id: 'BRL',
          }
        ],
        back_urls: {
          success: `${baseUrl}/payment`,
          failure: `${baseUrl}/payment`,
          pending: `${baseUrl}/payment`
        },
        auto_return: 'approved',
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Failed to create preference' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
    
    // SPA fallback: serve index.html for any unknown routes
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
