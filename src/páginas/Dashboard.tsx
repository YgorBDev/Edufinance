import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calculator, Trophy, Zap, TrendingUp, Award } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const { data: lessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*").order("lesson_order");
      return data ?? [];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["user_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: badges } = useQuery({
    queryKey: ["badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("badges").select("*").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: recentSimulations } = useQuery({
    queryKey: ["recent_simulations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalLessons = lessons?.length ?? 0;
  const completedLessons = progress?.length ?? 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const badgeLabels: Record<string, { label: string; icon: string }> = {
    first_lesson: { label: "Primeira Aula", icon: "📚" },
    first_simulation: { label: "Primeira Simulação", icon: "📊" },
    module_complete: { label: "Módulo Completo", icon: "🏆" },
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Olá, {profile?.name || "Estudante"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Continue sua jornada de educação financeira.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.level ?? 0}</p>
                <p className="text-xs text-muted-foreground">Nível</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.xp ?? 0}</p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{badges?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progresso na Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedLessons} de {totalLessons} aulas concluídas
          </p>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={() => navigate("/trilha")}
          size="lg"
          className="h-16 text-base gap-3"
        >
          <BookOpen className="w-5 h-5" />
          Continuar Aprendendo
        </Button>
        <Button
          onClick={() => navigate("/simulador")}
          size="lg"
          variant="outline"
          className="h-16 text-base gap-3 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <Calculator className="w-5 h-5" />
          Nova Simulação
        </Button>
      </div>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conquistas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => {
                const info = badgeLabels[b.badge_type] ?? { label: b.badge_type, icon: "🎖️" };
                return (
                  <Badge key={b.id} variant="secondary" className="text-sm py-1 px-3">
                    {info.icon} {info.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent simulations */}
      {recentSimulations && recentSimulations.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Últimas Simulações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSimulations.map((sim) => (
                <div key={sim.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-sm font-medium">{sim.investment_type}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {Number(sim.initial_value).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-secondary">
                    R$ {Number(sim.final_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
