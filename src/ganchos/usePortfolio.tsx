import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface PortfolioTransaction {
  id: string;
  stock_code: string;
  stock_name: string;
  transaction_type: "buy" | "sell";
  quantity: number;
  price_per_unit: number;
  total_value: number;
  created_at: string;
}

export interface PortfolioHolding {
  stock_code: string;
  stock_name: string;
  quantity: number;
  avg_price: number;
  total_invested: number;
}

export function usePortfolio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ["portfolio-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("portfolio_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PortfolioTransaction[];
    },
    enabled: !!user,
  });

  const { data: balance } = useQuery({
    queryKey: ["virtual-balance", user?.id],
    queryFn: async () => {
      if (!user) return 100000;
      const { data, error } = await supabase
        .from("profiles")
        .select("virtual_balance")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return Number(data?.virtual_balance ?? 100000);
    },
    enabled: !!user,
  });

  // Calculate holdings from transactions
  const holdings: PortfolioHolding[] = (() => {
    if (!transactions) return [];
    const map = new Map<string, PortfolioHolding>();
    
    for (const tx of [...transactions].reverse()) {
      const existing = map.get(tx.stock_code) || {
        stock_code: tx.stock_code,
        stock_name: tx.stock_name,
        quantity: 0,
        avg_price: 0,
        total_invested: 0,
      };

      if (tx.transaction_type === "buy") {
        const newTotal = existing.total_invested + tx.total_value;
        const newQty = existing.quantity + tx.quantity;
        existing.avg_price = newQty > 0 ? newTotal / newQty : 0;
        existing.quantity = newQty;
        existing.total_invested = newTotal;
      } else {
        existing.quantity -= tx.quantity;
        existing.total_invested = existing.quantity * existing.avg_price;
      }

      if (existing.quantity > 0) {
        map.set(tx.stock_code, existing);
      } else {
        map.delete(tx.stock_code);
      }
    }

    return Array.from(map.values());
  })();

  const buyStock = useMutation({
    mutationFn: async ({ stockCode, stockName, quantity, price }: {
      stockCode: string; stockName: string; quantity: number; price: number;
    }) => {
      if (!user) throw new Error("Não autenticado");
      const total = quantity * price;
      if (total > (balance ?? 0)) throw new Error("Saldo insuficiente");

      const { error: txError } = await supabase.from("portfolio_transactions").insert({
        user_id: user.id,
        stock_code: stockCode,
        stock_name: stockName,
        transaction_type: "buy",
        quantity,
        price_per_unit: price,
        total_value: total,
      });
      if (txError) throw txError;

      const { error: balError } = await supabase
        .from("profiles")
        .update({ virtual_balance: (balance ?? 100000) - total })
        .eq("id", user.id);
      if (balError) throw balError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["virtual-balance"] });
      toast({ title: "Compra realizada!", description: "Ação adicionada à sua carteira." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro na compra", description: err.message, variant: "destructive" });
    },
  });

  const sellStock = useMutation({
    mutationFn: async ({ stockCode, stockName, quantity, price }: {
      stockCode: string; stockName: string; quantity: number; price: number;
    }) => {
      if (!user) throw new Error("Não autenticado");
      const holding = holdings.find(h => h.stock_code === stockCode);
      if (!holding || holding.quantity < quantity) throw new Error("Quantidade insuficiente");

      const total = quantity * price;

      const { error: txError } = await supabase.from("portfolio_transactions").insert({
        user_id: user.id,
        stock_code: stockCode,
        stock_name: stockName,
        transaction_type: "sell",
        quantity,
        price_per_unit: price,
        total_value: total,
      });
      if (txError) throw txError;

      const { error: balError } = await supabase
        .from("profiles")
        .update({ virtual_balance: (balance ?? 100000) + total })
        .eq("id", user.id);
      if (balError) throw balError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["virtual-balance"] });
      toast({ title: "Venda realizada!", description: "Ação vendida com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro na venda", description: err.message, variant: "destructive" });
    },
  });

  return { transactions, holdings, balance, loadingTransactions, buyStock, sellStock };
}
