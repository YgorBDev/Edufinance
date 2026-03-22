import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import type { Lesson } from "@/pages/Trilha";

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onStartQuiz: () => void;
}

export default function LessonDetail({ lesson, onBack, onStartQuiz }: LessonDetailProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {lesson.content}
          </div>

          {lesson.example && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Exemplo prático
              </p>
              <p className="text-sm whitespace-pre-wrap">{lesson.example}</p>
            </div>
          )}

          <Button onClick={onStartQuiz} className="w-full gap-2 mt-4">
            <Play className="w-4 h-4" />
            Iniciar Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
