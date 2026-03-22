import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, DollarSign, Clock, Percent } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SimResult = {
  totalInvested: number;
  finalValue: number;
  profit: number;
  profitPercent: number;
  monthlyData: { month: number; investment: number; savings: number }[];
};

const riskInfo: Record<string, { label: string; color: string; level: string }> = {
  "Renda Fixa": { label: "Baixo", color: "bg-secondary text-secondary-foreground", level: "🟢" },
  FII: { label: "Médio", color: "bg-warning text-warning-foreground", level: "🟡" },
  "Ação": { label: "Alto", color: "bg-destructive text-destructive-foreground", level: "🔴" },
};

function calculateSimulation(
  initialValue: number,
  monthlyContribution: number,
  annualRate: number,
  timeMonths: number
): SimResult {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const savingsMonthlyRate = Math.pow(1 + 6 / 100, 1 / 12) - 1;
  const monthlyData: SimResult["monthlyData"] = [];

  let balance = initialValue;
  let savingsBalance = initialValue;

  for (let m = 0; m <= timeMonths; m++) {
    monthlyData.push({
      month: m,
      investment: Math.round(balance * 100) / 100,
      savings: Math.round(savingsBalance * 100) / 100,
    });
    if (m < timeMonths) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      savingsBalance = (savingsBalance + monthlyContribution) * (1 + savingsMonthlyRate);
    }
  }

  const totalInvested = initialValue + monthlyContribution * timeMonths;
  const finalValue = Math.round(balance * 100) / 100;
  const profit = Math.round((finalValue - totalInvested) * 100) / 100;
  const profitPercent = totalInvested > 0 ? Math.round((profit / totalInvested) * 10000) / 100 : 0;

  return { totalInvested, finalValue, profit, profitPercent, monthlyData };
}

export default function Simulador() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [type, setType] = useState("Renda Fixa");
  const [initial, setInitial] = useState("");
  const [monthly, setMonthly] = useState("");
  const [time, setTime] = useState("");
  const [rate, setRate] = useState("");
  const [result, setResult] = useState<SimResult | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (r: SimResult) => {
      if (!user) return;
      await supabase.from("simulations").insert({
        user_id: user.id,
        investment_type: type,
        initial_value: parseFloat(initial),
        monthly_contribution: parseFloat(monthly) || 0,
        annual_rate: parseFloat(rate),
        time_months: parseInt(time),
        final_value: r.finalValue,
      });

      // Check first simulation badge
      const { data: sims } = await supabase.from("simulations").select("id").eq("user_id", user.id);
      if (sims && sims.length === 1) {
        await supabase.from("badges").upsert({
          user_id: user.id,
          badge_type: "first_simulation",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent_simulations"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });

  const handleSimulate = () => {
    const iv = parseFloat(initial);
    const mc = parseFloat(monthly) || 0;
    const ar = parseFloat(rate);
    const tm = parseInt(time);

    if (!iv || !ar || !tm) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const r = calculateSimulation(iv, mc, ar, tm);
    setResult(r);
    saveMutation.mutate(r);
    toast({ title: "Simulação realizada! 📊" });
  };

  const risk = riskInfo[type];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold">Simulador de Investimentos</h1>
        <p className="text-muted-foreground mt-1">Simule e visualize o crescimento do seu patrimônio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Dados da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Investimento</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                  <SelectItem value="FII">FII (Fundo Imobiliário)</SelectItem>
                  <SelectItem value="Ação">Ação</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={`${risk.color} text-xs`}>{risk.level} Risco {risk.label}</Badge>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Valor Inicial (R$)</Label>
              <Input type="number" placeholder="1000" value={initial} onChange={(e) => setInitial(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Aporte Mensal (R$)</Label>
              <Input type="number" placeholder="200" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Tempo (meses)</Label>
              <Input type="number" placeholder="24" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Taxa de Retorno Anual (%)</Label>
              <Input type="number" placeholder="12" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>

            <Button onClick={handleSimulate} className="w-full" size="lg">
              <TrendingUp className="w-4 h-4 mr-2" /> Simular Investimento
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Valor Investido</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {result.totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-secondary/5">
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Valor Final</p>
                  <p className="text-xl font-bold text-secondary">
                    R$ {result.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Lucro</p>
                  <p className="text-xl font-bold text-secondary">
                    R$ {result.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Rentabilidade</p>
                  <p className="text-xl font-bold text-primary">{result.profitPercent}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolução Mês a Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={result.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} label={{ value: "Meses", position: "insideBottom", offset: -5 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
                      labelFormatter={(label) => `Mês ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="investment" stroke="hsl(var(--primary))" name="Seu Investimento" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="savings" stroke="hsl(var(--muted-foreground))" name="Poupança (6% a.a.)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
