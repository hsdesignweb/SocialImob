import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Initialize Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-4051969126176591-091022-e005a2436640f2156d3b99f273b81e8d-47941751' 
});

// API Routes
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { payment_id } = req.body;
    if (!payment_id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: payment_id });
    
    if (payment.status === 'approved' && payment.external_reference) {
      const { user_id, plan } = JSON.parse(payment.external_reference);
      
      if (user_id) {
        const { error } = await supabase.rpc('activate_subscription', {
          p_user_id: user_id,
          p_plan_type: plan || 'monthly'
        });
        
        if (error) {
          console.error('Verify payment RPC error:', error);
          return res.status(500).json({ error: 'Failed to activate subscription' });
        }
        
        return res.json({ success: true, plan });
      }
    }
    
    res.json({ success: false, status: payment.status });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

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
    const { return_url, user_email, user_id, coupon_code, plan = 'monthly' } = req.body;
    const preference = new Preference(client);
    
    // Get the base URL for redirection
    const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
    const backUrl = return_url ? `${baseUrl}${return_url}` : `${baseUrl}/payment?status=approved&plan=${plan}`;

    let transaction_amount = plan === 'yearly' ? 698.40 : 97; // Default prices
    const title = plan === 'yearly' ? 'SocialImob Pro - Plano Anual' : 'SocialImob Pro - Plano Mensal';

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

    const result = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: title,
            quantity: 1,
            unit_price: transaction_amount,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: user_email || undefined
        },
        back_urls: {
          success: backUrl,
          pending: backUrl,
          failure: `${baseUrl}/payment?status=failure`
        },
        auto_return: 'approved',
        external_reference: JSON.stringify({ user_id, plan, user_email }),
        notification_url: `${baseUrl}/api/webhook`,
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' } // Exclui boleto, permite PIX e Cartão
          ],
          installments: 12 // Permite parcelamento em até 12x
        }
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Failed to create preference' });
  }
});

// Webhook to handle Mercado Pago notifications
app.post('/api/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    // We only care about payment updates
    if (type === 'payment' && data?.id) {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: data.id });
      
      if (payment.status === 'approved' && payment.external_reference) {
        try {
          const { user_id, plan, user_email } = JSON.parse(payment.external_reference);
          
          if (user_id) {
            // Call Supabase RPC to activate subscription
            const { error } = await supabase.rpc('activate_subscription', {
              p_user_id: user_id,
              p_plan_type: plan || 'monthly'
            });
            
            if (error) {
              console.error('Webhook RPC error:', error);
            } else {
              console.log(`Subscription activated via webhook for user ${user_id} (${plan})`);
            }
          }
        } catch (parseError) {
          console.error('Error parsing external_reference:', parseError);
        }
      }
    }
    
    // Always return 200 OK to Mercado Pago
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
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
