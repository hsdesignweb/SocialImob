import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Supabase for backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Initialize Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-4051969126176591-091022-e005a2436640f2156d3b99f273b81e8d-47941751' 
});

// API Routes
app.post('/api/send-welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'SocialImob <sistema@socialimob.com>', // MUST BE VERIFIED IN RESEND
      to: [email],
      subject: 'Bem-vindo ao SocialImob Pro! 🎉',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #009EE3;">Sua assinatura foi confirmada!</h1>
          <p>Olá ${name || 'Corretor(a)'},</p>
          <p>Seu pagamento foi aprovado e sua conta <strong>SocialImob Pro</strong> já está ativa.</p>
          <p>Agora você tem acesso a todos os recursos premium, incluindo a criação ilimitada de posts com Inteligência Artificial.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Como acessar:</h3>
            <p style="margin-bottom: 5px;"><strong>Site:</strong> <a href="https://socialimob.com/login" style="color: #009EE3;">socialimob.com/login</a></p>
            <p style="margin-bottom: 0;"><strong>Seu e-mail:</strong> ${email}</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px;">(Use a senha que você criou no momento do cadastro)</p>
          </div>

          <p>Se precisar de ajuda ou tiver alguma dúvida, basta responder a este e-mail.</p>
          <p>Boas vendas!<br><strong>Equipe SocialImob</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/create-preference', async (req, res) => {
  try {
    const { return_url, user_email, coupon_code } = req.body;
    const preApproval = new PreApproval(client);
    
    // Get the base URL for redirection
    const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
    const backUrl = return_url ? `${baseUrl}${return_url}` : `${baseUrl}/payment?status=approved`;

    let transaction_amount = 97; // Default price

    // Validate coupon if provided
    if (coupon_code) {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .single();

      if (coupon && !error) {
        const discount = transaction_amount * (coupon.discount_percent / 100);
        transaction_amount = transaction_amount - discount;
        // Round to 2 decimal places
        transaction_amount = Math.round(transaction_amount * 100) / 100;
      }
    }

    const result = await preApproval.create({
      body: {
        reason: 'SocialImob Pro - Assinatura Mensal',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: transaction_amount,
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
