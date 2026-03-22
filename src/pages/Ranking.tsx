import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, Flame } from "lucide-react";

const rankIcons = [Crown, Trophy, Medal];
const rankColors = ["text-warning", "text-muted-foreground", "text-orange-600"];

export default function Ranking() {
  const { user } = useAuth();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, xp, level, current_streak, avatar_url")
        .order("xp", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const userRank = profiles?.findIndex((p) => p.id === user?.id);

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8 text-warning" />
          Ranking Global
        </h1>
        <p className="text-muted-foreground mt-1">Todos os estudantes ordenados por XP total.</p>
      </div>

      {userRank !== undefined && userRank >= 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Sua posição</p>
            <p className="text-3xl font-bold text-primary">#{userRank + 1}º</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Estudantes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {profiles?.map((p, idx) => {
                const isCurrentUser = p.id === user?.id;
                const RankIcon = rankIcons[idx] ?? Award;
                const rankColor = rankColors[idx] ?? "text-muted-foreground";
                const streak = (p as any).current_streak ?? 0;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isCurrentUser ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {idx < 3 ? (
                        <RankIcon className={`w-5 h-5 mx-auto ${rankColor}`} />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">{idx + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {p.name || "Estudante"}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">Você</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Nível {p.level}</p>
                    </div>

                    {/* Streak */}
                    {streak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <Flame className="w-3.5 h-3.5" />
                        {streak}
                      </div>
                    )}

                    {/* XP */}
                    <div className="text-right">
                      <p className="font-bold text-sm">{p.xp.toLocaleString("pt-BR")}</p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
