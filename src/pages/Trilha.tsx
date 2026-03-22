import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import ModuleSection from "@/components/trilha/ModuleSection";
import LessonDetail from "@/components/trilha/LessonDetail";
import QuizView from "@/components/trilha/QuizView";
import { Zap, Target, Trophy } from "lucide-react";

export type Lesson = {
  id: string;
  title: string;
  content: string;
  example: string | null;
  module: string;
  lesson_order: number;
};

export type Quiz = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
};

const MODULE_CONFIG: Record<string, { label: string; emoji: string; order: number }> = {
  fundamentos: { label: "Fundamentos", emoji: "📘", order: 1 },
  investimentos: { label: "Investimentos", emoji: "💰", order: 2 },
  planejamento: { label: "Planejamento Financeiro", emoji: "📋", order: 3 },
  acoes: { label: "Mercado de Ações", emoji: "📈", order: 4 },
  mentalidade: { label: "Mentalidade Financeira", emoji: "🧠", order: 5 },
  economia: { label: "Economia e Mercados Globais", emoji: "🌍", order: 6 },
  cripto: { label: "Criptomoedas e Ativos Digitais", emoji: "🪙", order: 7 },
};

export default function Trilha() {
  const { user } = useAuth();
  const { profile, addXp } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const { data: lessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*").order("lesson_order");
      return (data ?? []) as Lesson[];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["user_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: quizzes } = useQuery({
    queryKey: ["quizzes", activeLesson?.id],
    queryFn: async () => {
      if (!activeLesson) return [];
      const { data } = await supabase.from("quizzes").select("*").eq("lesson_id", activeLesson.id);
      return (data ?? []).map((q) => ({
        ...q,
        options: (typeof q.options === "string" ? JSON.parse(q.options) : q.options) as string[],
      })) as Quiz[];
    },
    enabled: !!activeLesson && quizMode,
  });

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) return;
      await supabase.from("user_progress").upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      const result = await addXp.mutateAsync(20);
      const { data: progressData } = await supabase
        .from("user_progress").select("*").eq("user_id", user.id).eq("completed", true);
      const completedCount = progressData?.length ?? 0;
      if (completedCount === 1) {
        await supabase.from("badges").upsert({ user_id: user.id, badge_type: "first_lesson" });
      }
      const totalLessons = lessons?.length ?? 5;
      if (completedCount >= totalLessons) {
        await supabase.from("badges").upsert({ user_id: user.id, badge_type: "module_complete" });
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user_progress"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast({ title: "🎉 +20 XP!", description: "Parabéns, aula concluída!" });
      if (result?.leveledUp) {
        setTimeout(() => {
          toast({ title: `🚀 Nível ${result.level}!`, description: "Você subiu de nível!" });
        }, 1000);
      }
      setActiveLesson(null);
      setQuizMode(false);
      setCurrentQuestion(0);
      setCorrectCount(0);
    },
  });

  const completedIds = new Set(
    progress?.filter((p) => p.completed).map((p) => p.lesson_id) ?? []
  );

  const totalLessons = lessons?.length ?? 0;
  const completedLessons = completedIds.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const modules = Object.entries(MODULE_CONFIG)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, config]) => ({
      key,
      ...config,
      lessons: (lessons ?? []).filter((l) => l.module === key),
    }))
    .filter((m) => m.lessons.length > 0);

  const handleAnswer = (answerIdx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIdx);
    setShowFeedback(true);
    if (quizzes && quizzes[currentQuestion].correct_answer === answerIdx) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (!quizzes) return;
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else if (activeLesson) {
      completeLessonMutation.mutate(activeLesson.id);
    }
  };

  const startQuiz = () => {
    setQuizMode(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCorrectCount(0);
  };

  if (activeLesson && !quizMode) {
    return (
      <LessonDetail
        lesson={activeLesson}
        onBack={() => setActiveLesson(null)}
        onStartQuiz={startQuiz}
      />
    );
  }

  if (activeLesson && quizMode) {
    if (!quizzes || quizzes.length === 0) {
      return (
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up text-center py-20">
          <div className="animate-pulse text-muted-foreground">Carregando quiz...</div>
        </div>
      );
    }
    return (
      <QuizView
        quizzes={quizzes}
        currentQuestion={currentQuestion}
        selectedAnswer={selectedAnswer}
        showFeedback={showFeedback}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onExit={() => setQuizMode(false)}
        correctCount={correctCount}
      />
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top stats bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Trilha de Aprendizado</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold">{profile?.xp ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Nível {profile?.level ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold">{completedLessons}/{totalLessons}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progresso geral</span>
          <span className="text-sm font-bold text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* Duolingo-style path */}
      <div className="space-y-12 pb-12">
        {modules.map((module) => {
          const moduleLessonsCompleted = module.lessons.filter((l) => completedIds.has(l.id)).length;

          return (
            <ModuleSection
              key={module.key}
              emoji={module.emoji}
              label={module.label}
              completedCount={moduleLessonsCompleted}
              totalCount={module.lessons.length}
              lessons={module.lessons}
              completedIds={completedIds}
              onSelectLesson={(lesson) => setActiveLesson(lesson)}
            />
          );
        })}
      </div>
    </div>
  );
}
