import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, PartyPopper, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import type { Quiz } from "@/pages/Trilha";

interface QuizViewProps {
  quizzes: Quiz[];
  currentQuestion: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onAnswer: (idx: number) => void;
  onNext: () => void;
  onExit: () => void;
  correctCount: number;
}

export default function QuizView({
  quizzes, currentQuestion, selectedAnswer, showFeedback, onAnswer, onNext, onExit, correctCount,
}: QuizViewProps) {
  const q = quizzes[currentQuestion];
  const isCorrect = selectedAnswer === q.correct_answer;
  const isLast = currentQuestion === quizzes.length - 1;
  const perfectScore = isLast && showFeedback && correctCount + (isCorrect ? 1 : 0) === quizzes.length;
  const confettiFired = useRef(false);

  useEffect(() => {
    if (perfectScore && !confettiFired.current) {
      confettiFired.current = true;
      // Fire confetti burst
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      // Big center burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });
    }
  }, [perfectScore]);

  // Reset ref when question changes
  useEffect(() => {
    confettiFired.current = false;
  }, [currentQuestion]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" /> Sair do quiz
        </button>
        <span className="text-sm text-muted-foreground">
          Pergunta {currentQuestion + 1} de {quizzes.length}
        </span>
      </div>

      <Progress value={((currentQuestion + (showFeedback ? 1 : 0)) / quizzes.length) * 100} className="h-2" />

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-lg font-semibold animate-fade-in">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((option, idx) => {
              let classes = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 text-sm ";
              if (!showFeedback) {
                classes += selectedAnswer === idx
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:scale-[1.01]";
              } else if (idx === q.correct_answer) {
                classes += "border-secondary bg-secondary/10 text-secondary animate-scale-in";
              } else if (idx === selectedAnswer && !isCorrect) {
                classes += "border-destructive bg-destructive/10 text-destructive animate-[shake_0.5s_ease-in-out]";
              } else {
                classes += "border-border opacity-40";
              }

              return (
                <button key={idx} onClick={() => onAnswer(idx)} className={classes} disabled={showFeedback}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-xl animate-fade-in ${isCorrect ? "bg-secondary/10 border border-secondary/30" : "bg-destructive/10 border border-destructive/30"}`}>
              <p className="font-semibold text-sm mb-1">{isCorrect ? "✅ Correto!" : "❌ Incorreto"}</p>
              {q.explanation && <p className="text-sm text-foreground/70">{q.explanation}</p>}
            </div>
          )}

          {perfectScore && (
            <div className="text-center py-4 animate-scale-in">
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-6 py-3 rounded-2xl border border-secondary/30">
                <Trophy className="w-6 h-6" />
                <span className="font-bold text-lg">Perfeito! 100% de acertos!</span>
                <PartyPopper className="w-6 h-6" />
              </div>
            </div>
          )}

          {showFeedback && (
            <Button onClick={onNext} className="w-full transition-transform hover:scale-[1.02]" size="lg">
              {isLast ? "Concluir Aula 🎉" : "Próxima Pergunta"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
