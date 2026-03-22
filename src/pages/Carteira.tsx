import { useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowDownUp, PieChart } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { LevelGate } from "@/components/LevelGate";

const COLORS = [
  "hsl(217, 91%, 50%)", "hsl(152, 60%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(280, 60%, 50%)", "hsl(190, 80%, 45%)",
];

export default function Carteira() {
  const { holdings, transactions, balance, loadingTransactions, sellStock } = usePortfolio();
  const [sellDialog, setSellDialog] = useState<{ code: string; name: string; maxQty: number } | null>(null);
  const [sellQty, setSellQty] = useState(1);
  const [showSellConfirm, setShowSellConfirm] = useState(false);

  const holdingCodes = holdings.map(h => h.stock_code).join(",");
  const { data: currentPrices } = useQuery({
    queryKey: ["holding-prices", holdingCodes],
    queryFn: async () => {
      if (!holdings.length) return {};
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const prices: Record<string, number> = {};
      for (const h of holdings) {
        try {
          const url = `https://${projectId}.supabase.co/functions/v1/brapi-proxy?endpoint=quote/${h.stock_code}`;
          const resp = await fetch(url, {
            headers: { "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          });
          const data = await resp.json();
          if (data.results?.[0]?.regularMarketPrice) {
            prices[h.stock_code] = data.results[0].regularMarketPrice;
          }
        } catch { /* skip */ }
      }
      return prices;
    },
    enabled: holdings.length > 0,
    staleTime: 60 * 1000,
  });

  const totalInvested = holdings.reduce((sum, h) => sum + h.total_invested, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => {
    const currentPrice = currentPrices?.[h.stock_code] ?? h.avg_price;
    return sum + h.quantity * currentPrice;
  }, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const patrimonio = (balance ?? 0) + totalCurrentValue;

  const pieData = holdings.map(h => ({
    name: h.stock_code,
    value: h.quantity * (currentPrices?.[h.stock_code] ?? h.avg_price),
  }));

  const sellPrice = currentPrices?.[sellDialog?.code ?? ""] ?? 0;
  const sellTotal = sellQty * sellPrice;

  const handleSell = () => {
    if (!sellDialog || sellPrice <= 0) return;
    sellStock.mutate({
      stockCode: sellDialog.code,
      stockName: sellDialog.name,
      quantity: sellQty,
      price: sellPrice,
    });
    setShowSellConfirm(false);
    setSellDialog(null);
    setSellQty(1);
  };

  return (
    <LevelGate featureName="Carteira">
      <div className="space-y-6 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold">Minha Carteira</h1>
          <p className="text-muted-foreground">Gerencie seus investimentos simulados.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">R$ {patrimonio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Patrimônio Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-lg font-bold">R$ {(balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Saldo Disponível</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-lg font-bold">R$ {totalCurrentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Em Ações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalGain >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                  {totalGain >= 0 ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
                </div>
                <div>
                  <p className={`text-lg font-bold ${totalGain >= 0 ? "text-success" : "text-destructive"}`}>
                    {totalGain >= 0 ? "+" : ""}R$ {totalGain.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{totalGainPercent.toFixed(2)}% Rendimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Minhas Ações</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <Skeleton className="h-40" />
              ) : holdings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma ação na carteira. Vá ao Mercado para comprar!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">PM</TableHead>
                      <TableHead className="text-right">Atual</TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((h) => {
                      const current = currentPrices?.[h.stock_code] ?? h.avg_price;
                      const gain = ((current - h.avg_price) / h.avg_price) * 100;
                      return (
                        <TableRow key={h.stock_code}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{h.stock_code}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[100px]">{h.stock_name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{h.quantity}</TableCell>
                          <TableCell className="text-right text-sm">R$ {h.avg_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-sm">R$ {current.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className={gain >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                              {gain >= 0 ? "+" : ""}{gain.toFixed(2)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setSellDialog({ code: h.stock_code, name: h.stock_name, maxQty: h.quantity }); setSellQty(1); }}
                            >
                              Vender
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {pieData.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Transaction history */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4" />
              Histórico de Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma operação realizada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 20).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant={tx.transaction_type === "buy" ? "default" : "secondary"}>
                          {tx.transaction_type === "buy" ? "Compra" : "Venda"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{tx.stock_code}</TableCell>
                      <TableCell className="text-right">{tx.quantity}</TableCell>
                      <TableCell className="text-right text-sm">R$ {Number(tx.price_per_unit).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium text-sm">R$ {Number(tx.total_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Sell Dialog */}
        <Dialog open={!!sellDialog} onOpenChange={(open) => { if (!open) setSellDialog(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vender {sellDialog?.code}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Preço atual: R$ {sellPrice.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Máximo: {sellDialog?.maxQty} unidades</p>
              <Input
                type="number"
                min={1}
                max={sellDialog?.maxQty ?? 1}
                value={sellQty}
                onChange={(e) => setSellQty(Math.max(1, Math.min(sellDialog?.maxQty ?? 1, parseInt(e.target.value) || 1)))}
              />
              <p className="font-medium">
                Total: R$ {sellTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSellDialog(null)}>Cancelar</Button>
              <Button onClick={() => setShowSellConfirm(true)} disabled={sellStock.isPending} variant="destructive">Vender</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sell Confirmation */}
        <ConfirmActionDialog
          open={showSellConfirm}
          onOpenChange={setShowSellConfirm}
          title="Confirmar Venda de Ações"
          description={`Você está prestes a vender ${sellQty} unidade(s) de ${sellDialog?.code}. Revise os detalhes.`}
          infoItems={[
            { label: "Ação", value: sellDialog?.code || "" },
            { label: "Quantidade", value: String(sellQty) },
            { label: "Preço Unitário", value: `R$ ${sellPrice.toFixed(2)}` },
            { label: "Valor Total", value: `R$ ${sellTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          ]}
          educationalTip="Vender ações encerra sua posição naquele ativo. O valor será creditado no seu saldo virtual. Lembre-se: vender em momentos de pânico pode gerar prejuízo. Avalie se é o momento certo."
          confirmLabel="Confirmar Venda"
          onConfirm={handleSell}
          variant="destructive"
          isPending={sellStock.isPending}
        />
      </div>
    </LevelGate>
  );
}
