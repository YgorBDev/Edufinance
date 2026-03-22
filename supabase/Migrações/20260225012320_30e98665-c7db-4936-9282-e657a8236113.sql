
-- Portfolio transactions table for simulated trading
CREATE TABLE public.portfolio_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stock_code TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit NUMERIC NOT NULL CHECK (price_per_unit > 0),
  total_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add virtual_balance to profiles
ALTER TABLE public.profiles ADD COLUMN virtual_balance NUMERIC NOT NULL DEFAULT 100000;

-- Enable RLS
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own transactions"
  ON public.portfolio_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.portfolio_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.portfolio_transactions FOR DELETE
  USING (auth.uid() = user_id);
