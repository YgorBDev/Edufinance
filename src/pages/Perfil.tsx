import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import {
  Trophy, Zap, Target, Flame, BookOpen, Star,
  TrendingUp, Award, Calendar, Shield, Sparkles, Crown, Pencil,
} from "lucide-react";

const BADGE_CONFIG: Record<string, { label: string; icon: typeof Trophy; color: string; description: string }> = {
  first_lesson: { label: "Primeira Aula", icon: BookOpen, color: "text-primary", description: "Completou a primeira aula" },
  module_complete: { label: "Módulo Completo", icon: Crown, color: "text-warning", description: "Completou todas as aulas" },
  first_simulation: { label: "Primeiro Simulador", icon: TrendingUp, color: "text-secondary", description: "Fez a primeira simulação" },
  streak_7: { label: "Ofensiva 7 dias", icon: Flame, color: "text-destructive", description: "Estudou 7 dias seguidos" },
  streak_30: { label: "Ofensiva 30 dias", icon: Flame, color: "text-destructive", description: "Estudou 30 dias seguidos" },
};

const ALL_BADGES = Object.keys(BADGE_CONFIG);

export default function Perfil() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  const { data: badges } = useQuery({
    queryKey: ["badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("badges").select("*").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: progressData } = useQuery({
    queryKey: ["user_progress_count", user?.id],
    queryFn: async () => {
      if (!user) return { completed: 0, total: 0 };
      const { data: completed } = await supabase
        .from("user_progress").select("id").eq("user_id", user.id).eq("completed", true);
      const { data: lessons } = await supabase.from("lessons").select("id");
      return { completed: completed?.length ?? 0, total: lessons?.length ?? 0 };
    },
    enabled: !!user,
  });

  const { data: transactionCount } = useQuery({
    queryKey: ["transaction_count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase.from("portfolio_transactions").select("id").eq("user_id", user.id);
      return data?.length ?? 0;
    },
    enabled: !!user,
  });

  const { data: rankData } = useQuery({
    queryKey: ["user_rank", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("id, xp").order("xp", { ascending: false });
      const rank = (data ?? []).findIndex((p) => p.id === user.id);
      return { rank: rank + 1, total: data?.length ?? 0 };
    },
    enabled: !!user,
  });

  const earnedBadgeTypes = new Set(badges?.map((b) => b.badge_type) ?? []);
  const xpInLevel = profile ? profile.xp % 100 : 0;
  const completedPercent = progressData
    ? progressData.total > 0 ? Math.round((progressData.completed / progressData.total) * 100) : 0
    : 0;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Hero card */}
      <Card className="border-0 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <CardContent className="pt-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Avatar" />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {(profile?.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold">{profile?.name || "Estudante"}</h1>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Target className="w-3.5 h-3.5" /> Nível {profile?.level ?? 0}
                </Badge>
                <Badge className="gap-1 bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
                  <Zap className="w-3.5 h-3.5" /> {profile?.xp ?? 0} XP
                </Badge>
                {rankData && (
                  <Badge className="gap-1 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20">
                    <Trophy className="w-3.5 h-3.5" /> #{rankData.rank}º de {rankData.total}
                  </Badge>
                )}
              </div>
              {/* XP Progress */}
              <div className="pt-2 max-w-xs mx-auto sm:mx-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso para Nível {(profile?.level ?? 0) + 1}</span>
                  <span className="font-semibold text-primary">{xpInLevel}/100 XP</span>
                </div>
                <Progress value={xpInLevel} className="h-2.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: "Aulas Concluídas", value: `${progressData?.completed ?? 0}/${progressData?.total ?? 0}`, color: "text-primary" },
          { icon: Flame, label: "Ofensiva Atual", value: `${profile?.current_streak ?? 0} dias`, color: "text-destructive" },
          { icon: Star, label: "Maior Ofensiva", value: `${profile?.longest_streak ?? 0} dias`, color: "text-warning" },
          { icon: TrendingUp, label: "Transações", value: String(transactionCount ?? 0), color: "text-secondary" },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4 text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress overview */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Trilha de Aprendizado</span>
              <span className="font-bold text-primary">{completedPercent}%</span>
            </div>
            <Progress value={completedPercent} className="h-3" />
          </div>
          {profile?.investor_type && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">Perfil de investidor: <span className="font-semibold capitalize">{profile.investor_type}</span></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges / Achievements */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-warning" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_BADGES.map((type) => {
              const config = BADGE_CONFIG[type];
              const earned = earnedBadgeTypes.has(type);
              const BadgeIcon = config.icon;

              return (
                <div
                  key={type}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    earned
                      ? "bg-card border-secondary/30 shadow-sm"
                      : "bg-muted/30 border-border opacity-50 grayscale"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    earned ? "bg-secondary/10" : "bg-muted"
                  }`}>
                    <BadgeIcon className={`w-5 h-5 ${earned ? config.color : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{config.label}</p>
                    <p className="text-[11px] text-muted-foreground">{config.description}</p>
                  </div>
                  {earned && (
                    <Award className="w-4 h-4 text-secondary shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentName={profile?.name || ""}
        currentAvatarUrl={profile?.avatar_url || null}
      />
    </div>
  );
}
