import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Star, Crown, Sparkles } from "lucide-react";
import type { Lesson } from "@/pages/Trilha";

interface ModuleSectionProps {
  emoji: string;
  label: string;
  completedCount: number;
  totalCount: number;
  lessons: Lesson[];
  completedIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
}

export default function ModuleSection({
  emoji, label, completedCount, totalCount, lessons, completedIds, onSelectLesson,
}: ModuleSectionProps) {
  const allComplete = completedCount === totalCount && totalCount > 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col items-center">
      {/* Module header */}
      <div className="w-full max-w-sm mx-auto mb-6">
        <div className={`
          bg-card border rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm transition-all duration-500
          ${allComplete 
            ? "border-secondary/50 bg-secondary/5 shadow-secondary/20 shadow-md" 
            : "border-border"
          }
        `}>
          <span className={`text-2xl ${allComplete ? "animate-[bounce_1s_ease-in-out_infinite]" : ""}`}>{emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate">{label}</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{completedCount}/{totalCount} aulas</p>
              {progressPercent > 0 && !allComplete && (
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[60px]">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          {allComplete && (
            <Badge variant="secondary" className="text-xs shrink-0 gap-1 animate-scale-in">
              <Sparkles className="w-3 h-3" /> Completo
            </Badge>
          )}
        </div>
      </div>

      {/* Winding path of lesson nodes */}
      <div className="flex flex-col items-center gap-4">
        {lessons.map((lesson, index) => {
          const completed = completedIds.has(lesson.id);
          const offset = index % 2 === 0 ? -40 : 40;
          const prevCompleted = index === 0 || completedIds.has(lessons[index - 1].id);
          const isNext = !completed && prevCompleted;

          return (
            <div 
              key={lesson.id} 
              className="flex flex-col items-center"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Connector line */}
              {index > 0 && (
                <div className={`w-0.5 h-4 mb-1 transition-colors duration-500 ${
                  completed ? "bg-secondary/50" : "bg-border"
                }`} />
              )}

              {/* Lesson node */}
              <button
                onClick={() => onSelectLesson(lesson)}
                className="group relative animate-fade-in"
                style={{ 
                  transform: `translateX(${offset}px)`,
                  animationDelay: `${index * 80}ms`,
                  animationFillMode: "backwards",
                }}
                title={lesson.title}
              >
                <div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    transition-all duration-300 shadow-lg
                    ${completed
                      ? "bg-secondary text-secondary-foreground ring-4 ring-secondary/30"
                      : isNext
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/40 hover:ring-primary/60 hover:scale-110 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                        : "bg-primary text-primary-foreground ring-4 ring-primary/20 hover:ring-primary/40 hover:scale-110"
                    }
                  `}
                >
                  {completed ? (
                    <CheckCircle className="w-7 h-7" />
                  ) : index === 0 ? (
                    <Star className="w-7 h-7" />
                  ) : index === lessons.length - 1 ? (
                    <Crown className="w-7 h-7" />
                  ) : (
                    <BookOpen className="w-6 h-6" />
                  )}
                </div>

                {/* Glow effect for next lesson */}
                {isNext && (
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                )}

                {/* Tooltip label */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-[11px] font-medium transition-colors ${
                    isNext ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}>
                    {lesson.title.length > 20 ? lesson.title.slice(0, 18) + "…" : lesson.title}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
