CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública para cupons ativos (para validação no frontend/backend)
CREATE POLICY "Allow public read access to active coupons" ON coupons
  FOR SELECT USING (active = true);
