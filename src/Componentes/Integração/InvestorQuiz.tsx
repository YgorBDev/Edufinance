import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, Zap } from "lucide-react";

const questions = [
  {
    question: "Por quanto tempo você pretende manter seus investimentos?",
    options: [
      { value: "a", label: "Menos de 1 ano", score: 1 },
      { value: "b", label: "De 1 a 5 anos", score: 2 },
      { value: "c", label: "Mais de 5 anos", score: 3 },
    ],
  },
  {
    question: "Se seus investimentos caíssem 20% em um mês, o que você faria?",
    options: [
      { value: "a", label: "Venderia tudo imediatamente", score: 1 },
      { value: "b", label: "Esperaria a recuperação", score: 2 },
      { value: "c", label: "Compraria mais para aproveitar o preço baixo", score: 3 },
    ],
  },
  {
    question: "Qual é seu principal objetivo financeiro?",
    options: [
      { value: "a", label: "Preservar meu patrimônio", score: 1 },
      { value: "b", label: "Crescer com equilíbrio entre risco e retorno", score: 2 },
      { value: "c", label: "Maximizar retornos, mesmo com mais risco", score: 3 },
    ],
  },
  {
    question: "Qual percentual da sua renda você se sentiria confortável investindo?",
    options: [
      { value: "a", label: "Até 10%", score: 1 },
      { value: "b", label: "Entre 10% e 30%", score: 2 },
      { value: "c", label: "Mais de 30%", score: 3 },
    ],
  },
  {
    question: "Qual tipo de investimento mais te atrai?",
    options: [
      { value: "a", label: "Poupança e Tesouro Direto", score: 1 },
      { value: "b", label: "Fundos de investimento e CDBs", score: 2 },
      { value: "c", label: "Ações e criptomoedas", score: 3 },
    ],
  },
];

function getInvestorType(score: number): { type: string; label: string; description: string; icon: typeof Shield } {
  if (score <= 7) {
    return {
      type: "conservador",
      label: "Conservador",
      description: "Você prefere segurança e previsibilidade. Investimentos de renda fixa são ideais para seu perfil.",
      icon: Shield,
    };
  }
  if (score <= 11) {
    return {
      type: "moderado",
      label: "Moderado",
      description: "Você busca equilíbrio entre risco e retorno. Uma carteira diversificada combina bem com seu perfil.",
      icon: TrendingUp,
    };
  }
  return {
    type: "arrojado",
    label: "Arrojado",
    description: "Você aceita riscos maiores em busca de retornos mais altos. Ações e ativos voláteis fazem parte do seu perfil.",
    icon: Zap,
  };
}

interface InvestorQuizProps {
  open: boolean;
  onComplete: (type: string) => void;
}

export function InvestorQuiz({ open, onComplete }: InvestorQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [result, setResult] = useState<ReturnType<typeof getInvestorType> | null>(null);

  const isLastQuestion = step === questions.length - 1;
  const progress = ((step + (result ? 1 : 0)) / questions.length) * 100;

  const handleNext = () => {
    const newAnswers = [...answers, current];
    setAnswers(newAnswers);
    setCurrent("");

    if (isLastQuestion) {
      const totalScore = newAnswers.reduce((acc, ans, idx) => {
        const opt = questions[idx].options.find((o) => o.value === ans);
        return acc + (opt?.score ?? 0);
      }, 0);
      setResult(getInvestorType(totalScore));
    } else {
      setStep(step + 1);
    }
  };

  if (result) {
    const Icon = result.icon;
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Seu perfil: {result.label}</h2>
            <p className="text-muted-foreground">{result.description}</p>
            <Button onClick={() => onComplete(result.type)} className="w-full mt-4">
              Começar a aprender! 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const q = questions[step];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg">Descubra seu Perfil de Investidor</DialogTitle>
          <DialogDescription>Pergunta {step + 1} de {questions.length}</DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2" />

        <div className="space-y-4 mt-2">
          <p className="font-medium">{q.question}</p>
          <RadioGroup value={current} onValueChange={setCurrent}>
            {q.options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value={opt.value} id={`q${step}-${opt.value}`} />
                <Label htmlFor={`q${step}-${opt.value}`} className="cursor-pointer flex-1">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleNext} disabled={!current} className="w-full mt-2">
          {isLastQuestion ? "Ver Resultado" : "Próxima"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
