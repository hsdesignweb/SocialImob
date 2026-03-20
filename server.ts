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
app.post('/api/admin/update-user', async (req, res) => {
  try {
    const { admin_id, user_id, name, credits, status, is_paid } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!admin_id || !user_id || !token) {
      return res.status(400).json({ error: 'Missing required fields or token' });
    }

    // Create a Supabase client authenticated as the admin user
    const userSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '', {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify caller is admin using their token
    const { data: adminData, error: adminError } = await userSupabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', admin_id)
      .single();

    const isAdmin = adminData?.is_admin || adminData?.email === 'hebert.ss@gmail.com';

    if (adminError || !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Auto-fix the is_admin flag for the designated admin if it's false
    if (adminData?.email === 'hebert.ss@gmail.com' && !adminData?.is_admin) {
      console.log('Auto-fixing is_admin flag for designated admin...');
      await userSupabase.from('profiles').update({ is_admin: true }).eq('id', admin_id);
    }

    // Update user
    // If we have the service role key, use the global supabase client to bypass RLS
    // Otherwise, use the user's client (which requires the RLS policy to be applied)
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log(`Updating user ${user_id}. Using service role key: ${hasServiceRoleKey}`);
    const clientToUse = hasServiceRoleKey ? supabase : userSupabase;

    // Fetch current user to check if expires_at needs updating
    const { data: currentUser } = await clientToUse.from('profiles').select('expires_at, status').eq('id', user_id).single();
    
    let updatePayload: any = {
        name,
        credits,
        status,
        is_paid
    };

    // If changing to active and the subscription is currently expired or in the past, extend it
    if (status === 'active' && currentUser) {
        const now = new Date();
        const currentExpiresAt = currentUser.expires_at ? new Date(currentUser.expires_at) : null;
        
        if (!currentExpiresAt || currentExpiresAt < now) {
            // Extend by 30 days
            const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            updatePayload.expires_at = newExpiresAt.toISOString();
            console.log(`Extending subscription for user ${user_id} to ${updatePayload.expires_at}`);
        }
    }

    const { data, error: updateError } = await clientToUse
      .from('profiles')
      .update(updatePayload)
      .eq('id', user_id)
      .select();

    if (updateError) {
      console.error('Error updating user:', updateError);
      if (updateError.message?.includes('violates check constraint')) {
        return res.status(400).json({ error: 'Erro de restrição no banco de dados. Por favor, execute a migração SQL mais recente no Supabase para permitir os novos status (Expirado, Trial).' });
      }
      return res.status(500).json({ error: 'Failed to update user' });
    }

    if (!data || data.length === 0) {
      console.error('Update blocked by RLS or user not found');
      return res.status(403).json({ error: 'Update blocked by RLS. Please add SUPABASE_SERVICE_ROLE_KEY to your Secrets or run the admin update policy migration in Supabase.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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
        let rpcError = null;
        try {
          const { error } = await supabase.rpc('activate_subscription', {
            p_user_id: user_id,
            p_plan_type: plan || 'monthly'
          });
          rpcError = error;
        } catch (e) {
          rpcError = e;
        }
        
        if (rpcError) {
          console.error('Verify payment RPC error, falling back to direct update:', rpcError);
          // Fallback to direct update using service role key
          const { data, error: updateError } = await supabase
            .from('profiles')
            .update({
              is_paid: true,
              status: 'active',
              credits: plan === 'yearly' ? 1200 : 100,
              subscription_date: new Date().toISOString(),
              // We can't easily calculate expires_at in JS with exact calendar months like Postgres interval,
              // but we can approximate for the fallback.
              expires_at: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', user_id)
            .select();
            
          if (updateError) {
             console.error('Fallback update error:', updateError);
             return res.status(500).json({ error: 'Failed to activate subscription' });
          } else if (!data || data.length === 0) {
             console.error(`Fallback failed: RLS blocked update for user ${user_id}. Please add SUPABASE_SERVICE_ROLE_KEY to Secrets.`);
             return res.status(500).json({ error: 'Failed to activate subscription due to database permissions' });
          }
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
      try {
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: data.id });
        
        if (payment.status === 'approved' && payment.external_reference) {
          try {
            const { user_id, plan, user_email } = JSON.parse(payment.external_reference);
            
            if (user_id) {
              // Call Supabase RPC to activate subscription
              let rpcError = null;
              try {
                const { error } = await supabase.rpc('activate_subscription', {
                  p_user_id: user_id,
                  p_plan_type: plan || 'monthly'
                });
                rpcError = error;
              } catch (e) {
                rpcError = e;
              }
              
              if (rpcError) {
                console.error('Webhook RPC error, falling back to direct update:', rpcError);
                const { data: updateData, error: updateError } = await supabase
                  .from('profiles')
                  .update({
                    is_paid: true,
                    status: 'active',
                    credits: plan === 'yearly' ? 1200 : 100,
                    subscription_date: new Date().toISOString(),
                    expires_at: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
                  })
                  .eq('id', user_id)
                  .select();
                  
                if (updateError) {
                  console.error('Webhook fallback update error:', updateError);
                } else if (!updateData || updateData.length === 0) {
                  console.error(`Webhook fallback failed: RLS blocked update for user ${user_id}. Please add SUPABASE_SERVICE_ROLE_KEY to Secrets.`);
                } else {
                  console.log(`Subscription activated via webhook fallback for user ${user_id} (${plan})`);
                }
              } else {
                console.log(`Subscription activated via webhook for user ${user_id} (${plan})`);
              }
            }
          } catch (parseError) {
            console.error('Error parsing external_reference:', parseError);
          }
        }
      } catch (mpError) {
        console.error('Error fetching payment from Mercado Pago (this is normal during simulation):', mpError);
        // We still want to return 200 OK so MP doesn't retry
      }
    }
    
    // Always return 200 OK to Mercado Pago so they know we received it
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    // Only return 500 if there's a catastrophic failure in our server logic
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
