import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, LineChart, Wallet, Bot, Trophy, Flame, BarChart3, ArrowRight } from "lucide-react";

const tutorialSteps = [
  {
    icon: BookOpen,
    title: "Trilha de Aprendizado 📚",
    description: "Aprenda sobre finanças com microaulas interativas no estilo Duolingo. Complete quizzes, ganhe XP e suba de nível!",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Bot,
    title: "Professor FinBot 🤖",
    description: "Seu assistente de finanças pessoal! Tire dúvidas, peça recomendações de ações baseadas em dados e aprenda conceitos financeiros.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Calculator,
    title: "Simulador de Investimentos 📊",
    description: "Simule investimentos em renda fixa e variável. Visualize projeções de rendimento com gráficos interativos.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: LineChart,
    title: "Mercado (Nível 3) 📈",
    description: "Acesse cotações reais da bolsa brasileira. Compre ações com dinheiro virtual para praticar. Disponível após atingir Nível 3!",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Wallet,
    title: "Carteira Virtual (Nível 3) 💼",
    description: "Gerencie sua carteira de investimentos virtuais. Acompanhe lucros e prejuízos como se fosse real!",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Flame,
    title: "Ofensiva de Estudo 🔥",
    description: "Mantenha uma sequência diária de estudos! Você pode ficar até 2 dias sem estudar antes de perder a ofensiva. Quanto maior a ofensiva, melhor!",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: BarChart3,
    title: "Ranking Global 🏆",
    description: "Compete com outros estudantes! O ranking é baseado no total de XP ganho. Estude, complete quizzes e suba no ranking!",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

interface SiteTutorialProps {
  open: boolean;
  onComplete: () => void;
}

export function SiteTutorial({ open, onComplete }: SiteTutorialProps) {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];
  const isLast = step === tutorialSteps.length - 1;
  const Icon = current.icon;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <div className="text-center space-y-5 py-4">
          {/* Step indicators */}
          <div className="flex justify-center gap-1.5">
            {tutorialSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className={`w-16 h-16 rounded-2xl ${current.bg} flex items-center justify-center mx-auto`}>
            <Icon className={`w-8 h-8 ${current.color}`} />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">{current.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{current.description}</p>
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Voltar
              </Button>
            )}
            <Button onClick={isLast ? onComplete : () => setStep(step + 1)} className="flex-1 gap-2">
              {isLast ? "Começar!" : "Próximo"}
              {!isLast && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          {!isLast && (
            <button onClick={onComplete} className="text-xs text-muted-foreground hover:underline">
              Pular tutorial
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
