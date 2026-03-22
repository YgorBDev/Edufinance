import { useState } from "react";
import { useStockList, useStockQuote } from "@/hooks/useStocks";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Search, ShoppingCart, DollarSign, ArrowDownUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { LevelGate } from "@/components/LevelGate";

export default function Mercado() {
  const { data: stocks, isLoading } = useStockList();
  const { balance, holdings, buyStock, sellStock } = usePortfolio();
  const [search, setSearch] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [tradeTab, setTradeTab] = useState<"buy" | "sell">("buy");
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: stockDetail, isLoading: loadingDetail } = useStockQuote(selectedTicker || "");

  const filtered = stocks?.filter(s =>
    s.symbol?.toLowerCase().includes(search.toLowerCase()) ||
    s.shortName?.toLowerCase().includes(search.toLowerCase()) ||
    s.longName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const holding = holdings.find(h => h.stock_code === selectedTicker);
  const totalCost = qty * (stockDetail?.regularMarketPrice ?? 0);

  const handleConfirm = () => {
    if (!stockDetail || !selectedTicker) return;
    const params = {
      stockCode: selectedTicker,
      stockName: stockDetail.longName || stockDetail.shortName || selectedTicker,
      quantity: qty,
      price: stockDetail.regularMarketPrice,
    };
    if (tradeTab === "buy") {
      buyStock.mutate(params);
    } else {
      sellStock.mutate(params);
    }
    setShowConfirm(false);
    setSelectedTicker(null);
    setQty(1);
    setTradeTab("buy");
  };

  const canBuy = stockDetail && totalCost <= (balance ?? 0);
  const canSell = stockDetail && holding && qty <= holding.quantity;
  const isPending = buyStock.isPending || sellStock.isPending;

  return (
    <LevelGate featureName="Mercado">
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mercado</h1>
            <p className="text-muted-foreground">Explore ações e invista com seu saldo virtual.</p>
          </div>
          <Card className="border-0 shadow-md px-4 py-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Saldo:</span>
              <span className="font-bold text-secondary">
                R$ {(balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ação por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((stock) => {
              const owned = holdings.find(h => h.stock_code === stock.symbol);
              return (
                <Card
                  key={stock.symbol}
                  className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => { setSelectedTicker(stock.symbol); setTradeTab("buy"); setQty(1); }}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {stock.logourl && (
                          <img src={stock.logourl} alt={stock.symbol} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="font-bold text-sm">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{stock.shortName}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={(stock.regularMarketChangePercent ?? 0) >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
                      >
                        {(stock.regularMarketChangePercent ?? 0) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {stock.regularMarketChangePercent?.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">
                        R$ {stock.regularMarketPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {owned && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {owned.quantity} un.
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma ação encontrada. A API pode estar com limite de requisições.</p>
          </div>
        )}

        {/* Stock Detail Dialog */}
        <Dialog open={!!selectedTicker} onOpenChange={(open) => { if (!open) setSelectedTicker(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTicker}
                {stockDetail && (
                  <Badge
                    variant="secondary"
                    className={
                      (stockDetail.regularMarketChangePercent ?? 0) >= 0
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {(stockDetail.regularMarketChangePercent ?? 0) >= 0 ? "+" : ""}
                    {stockDetail.regularMarketChangePercent?.toFixed(2)}%
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {loadingDetail ? (
              <Skeleton className="h-48" />
            ) : stockDetail ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{stockDetail.longName || stockDetail.shortName}</p>
                <p className="text-3xl font-bold">
                  R$ {stockDetail.regularMarketPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>

                {holding && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="text-muted-foreground text-xs mb-1">Sua posição</p>
                    <div className="flex justify-between">
                      <span>{holding.quantity} un. • PM: R$ {holding.avg_price.toFixed(2)}</span>
                      <span className="font-medium">
                        R$ {(holding.quantity * stockDetail.regularMarketPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {stockDetail.historicalDataPrice && stockDetail.historicalDataPrice.length > 0 && (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stockDetail.historicalDataPrice}>
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d: string) => {
                            const date = new Date(d);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(val: number) => [`R$ ${val.toFixed(2)}`, "Preço"]}
                          labelFormatter={(d: string) => new Date(d).toLocaleDateString("pt-BR")}
                        />
                        <Line type="monotone" dataKey="close" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Volume</p>
                    <p className="font-medium">{stockDetail.regularMarketVolume?.toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Mín / Máx Dia</p>
                    <p className="font-medium">
                      {stockDetail.regularMarketDayLow?.toFixed(2)} / {stockDetail.regularMarketDayHigh?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Tabs value={tradeTab} onValueChange={(v) => { setTradeTab(v as "buy" | "sell"); setQty(1); }}>
                  <TabsList className="w-full">
                    <TabsTrigger value="buy" className="flex-1 gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" /> Comprar
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="flex-1 gap-1" disabled={!holding}>
                      <ArrowDownUp className="w-3.5 h-3.5" /> Vender
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="buy" className="mt-3">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        Total: R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {!canBuy && qty > 0 && (
                      <p className="text-xs text-destructive mt-1">Saldo insuficiente</p>
                    )}
                  </TabsContent>

                  <TabsContent value="sell" className="mt-3">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        max={holding?.quantity ?? 1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Math.min(holding?.quantity ?? 1, parseInt(e.target.value) || 1)))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        Total: R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        {holding && <span className="ml-2">(máx: {holding.quantity})</span>}
                      </span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <p className="text-muted-foreground">Não foi possível carregar os dados.</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicker(null)}>Cancelar</Button>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={!stockDetail || isPending || (tradeTab === "buy" ? !canBuy : !canSell)}
                className="gap-2"
                variant={tradeTab === "sell" ? "destructive" : "default"}
              >
                {tradeTab === "buy" ? <ShoppingCart className="w-4 h-4" /> : <ArrowDownUp className="w-4 h-4" />}
                {tradeTab === "buy" ? "Comprar" : "Vender"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Dialog */}
        <ConfirmActionDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title={tradeTab === "buy" ? "Confirmar Compra de Ações" : "Confirmar Venda de Ações"}
          description={
            tradeTab === "buy"
              ? `Você está prestes a comprar ${qty} unidade(s) de ${selectedTicker}.`
              : `Você está prestes a vender ${qty} unidade(s) de ${selectedTicker}.`
          }
          infoItems={[
            { label: "Ação", value: selectedTicker || "" },
            { label: "Quantidade", value: String(qty) },
            { label: "Preço Unitário", value: `R$ ${(stockDetail?.regularMarketPrice ?? 0).toFixed(2)}` },
            { label: tradeTab === "buy" ? "Custo Total" : "Valor a Receber", value: `R$ ${totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          ]}
          educationalTip={
            tradeTab === "buy"
              ? "Comprar ações significa adquirir uma pequena parte de uma empresa. O preço pode variar diariamente conforme o mercado."
              : "Ao vender, você realiza o lucro ou prejuízo da operação. O valor será creditado no seu saldo virtual."
          }
          confirmLabel={tradeTab === "buy" ? "Confirmar Compra" : "Confirmar Venda"}
          variant={tradeTab === "sell" ? "destructive" : "default"}
          onConfirm={handleConfirm}
          isPending={isPending}
        />
      </div>
    </LevelGate>
  );
}
