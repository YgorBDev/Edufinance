import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, BookOpen, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const REQUIRED_LEVEL = 3;

interface LevelGateProps {
  children: React.ReactNode;
  featureName: string;
}

export function LevelGate({ children, featureName }: LevelGateProps) {
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();

  if (isLoading) return null;

  const userLevel = profile?.level ?? 0;
  const isUnlocked = userLevel >= REQUIRED_LEVEL;

  if (isUnlocked) return <>{children}</>;

  const progressPercent = (userLevel / REQUIRED_LEVEL) * 100;

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-slide-up">
      <Card className="border-0 shadow-xl max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{featureName} Bloqueado</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Para acessar o <strong>{featureName}</strong>, você precisa atingir o{" "}
              <strong>Nível {REQUIRED_LEVEL}</strong> na Trilha de Aprendizado.
              Isso garante que você tenha o conhecimento necessário para tomar decisões
              informadas sobre investimentos.
            </p>
          </div>

          <div className="space-y-2 px-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Trophy className="w-4 h-4 text-warning" />
                Seu nível: {userLevel}
              </span>
              <span className="text-muted-foreground">Meta: Nível {REQUIRED_LEVEL}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Complete mais aulas para subir de nível. Cada aula concede 20 XP.
            </p>
          </div>

          <div className="space-y-3 px-4">
            <h3 className="text-sm font-semibold">O que você vai aprender antes:</h3>
            <ul className="text-sm text-muted-foreground text-left space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                Fundamentos de finanças pessoais e orçamento
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                Tipos de investimentos e seus riscos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                Como analisar ações e tomar decisões
              </li>
            </ul>
          </div>

          <Button onClick={() => navigate("/trilha")} className="gap-2 w-full">
            <BookOpen className="w-4 h-4" />
            Ir para a Trilha de Aprendizado
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
