import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
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
    const { return_url, user_email } = req.body;
    const preApproval = new PreApproval(client);
    
    // Get the base URL for redirection
    const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
    
    const backUrl = return_url ? `${baseUrl}${return_url}` : `${baseUrl}/payment?status=approved`;

    const result = await preApproval.create({
      body: {
        reason: 'SocialImob Pro - Assinatura Mensal',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 97,
          currency_id: 'BRL'
        },
        back_url: backUrl,
        payer_email: user_email || undefined
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
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
