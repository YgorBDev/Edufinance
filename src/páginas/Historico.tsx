import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Eye, X } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type Simulation = {
  id: string;
  investment_type: string;
  initial_value: number;
  monthly_contribution: number;
  annual_rate: number;
  time_months: number;
  final_value: number;
  created_at: string;
};

function regenerateChart(sim: Simulation) {
  const monthlyRate = Math.pow(1 + sim.annual_rate / 100, 1 / 12) - 1;
  const savingsRate = Math.pow(1.06, 1 / 12) - 1;
  const data = [];
  let bal = sim.initial_value;
  let sav = sim.initial_value;

  for (let m = 0; m <= sim.time_months; m++) {
    data.push({ month: m, investment: Math.round(bal * 100) / 100, savings: Math.round(sav * 100) / 100 });
    if (m < sim.time_months) {
      bal = (bal + sim.monthly_contribution) * (1 + monthlyRate);
      sav = (sav + sim.monthly_contribution) * (1 + savingsRate);
    }
  }
  return data;
}

const riskColors: Record<string, string> = {
  "Renda Fixa": "bg-secondary text-secondary-foreground",
  FII: "bg-warning text-warning-foreground",
  "Ação": "bg-destructive text-destructive-foreground",
};

export default function Historico() {
  const { user } = useAuth();
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);

  const { data: simulations, isLoading } = useQuery({
    queryKey: ["all_simulations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as Simulation[];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold">Minhas Simulações</h1>
        <p className="text-muted-foreground mt-1">Reveja suas simulações anteriores.</p>
      </div>

      {selectedSim && (
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Gráfico: {selectedSim.investment_type} — R$ {Number(selectedSim.initial_value).toLocaleString("pt-BR")}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedSim(null)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={regenerateChart(selectedSim)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="investment" stroke="hsl(var(--primary))" name="Investimento" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="savings" stroke="hsl(var(--muted-foreground))" name="Poupança" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : simulations && simulations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor Inicial</TableHead>
                    <TableHead>Aporte</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Valor Final</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulations.map((sim) => (
                    <TableRow key={sim.id}>
                      <TableCell>
                        <Badge className={`${riskColors[sim.investment_type] ?? ""} text-xs`}>
                          {sim.investment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>R$ {Number(sim.initial_value).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>R$ {Number(sim.monthly_contribution).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{sim.time_months} meses</TableCell>
                      <TableCell>{sim.annual_rate}% a.a.</TableCell>
                      <TableCell className="font-semibold text-secondary">
                        R$ {Number(sim.final_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(sim.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSim(sim)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma simulação ainda.</p>
              <p className="text-sm text-muted-foreground mt-1">Use o simulador para criar sua primeira!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
