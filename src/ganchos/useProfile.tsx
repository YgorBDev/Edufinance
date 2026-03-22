import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addXp = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !profile) return;
      const newXp = profile.xp + amount;
      const newLevel = Math.floor(newXp / 100);

      // Update streak: check last_study_date
      const today = new Date().toISOString().split("T")[0];
      const lastStudy = (profile as any).last_study_date as string | null;
      let currentStreak = (profile as any).current_streak ?? 0;
      let longestStreak = (profile as any).longest_streak ?? 0;

      if (lastStudy !== today) {
        if (lastStudy) {
          const lastDate = new Date(lastStudy);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 2) {
            // Within grace period, continue streak
            currentStreak += 1;
          } else {
            // Lost streak
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          xp: newXp,
          level: newLevel,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_study_date: today,
        } as any)
        .eq("id", user.id);
      if (error) throw error;
      return { xp: newXp, level: newLevel, leveledUp: newLevel > profile.level };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return { profile, isLoading, addXp };
}
