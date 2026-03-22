import { Flame } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function StreakDisplay() {
  const { profile } = useProfile();

  if (!profile) return null;

  const streak = (profile as any).current_streak ?? 0;
  const isActive = streak > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-colors ${
          isActive 
            ? "bg-destructive/10 text-destructive" 
            : "bg-muted text-muted-foreground"
        }`}>
          <Flame className={`w-4 h-4 ${isActive ? "text-destructive" : ""}`} />
          <span>{streak}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">
          {isActive
            ? `🔥 Ofensiva de ${streak} dia${streak > 1 ? "s" : ""}!`
            : "Estude hoje para iniciar sua ofensiva!"}
        </p>
        <p className="text-xs text-muted-foreground">Você pode ficar até 2 dias sem estudar.</p>
      </TooltipContent>
    </Tooltip>
  );
}
