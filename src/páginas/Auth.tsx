import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-glow text-primary text-2xl font-bold">EduFinance</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      }
    } else {
      if (!name.trim()) {
        toast({ title: "Nome obrigatório", description: "Por favor, insira seu nome.", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-center p-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-primary">Edu</span>
          <span className="text-secondary">Finance</span>
        </h1>
        <p className="text-lg text-sidebar-foreground/70 mb-10">
          Aprenda a investir de forma inteligente com aulas gamificadas e simulações reais.
        </p>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Trilhas de Aprendizado</h3>
              <p className="text-sm text-sidebar-foreground/60">Aulas curtas no estilo Duolingo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Simulador de Investimentos</h3>
              <p className="text-sm text-sidebar-foreground/60">Simule e visualize seus ganhos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Gráficos Interativos</h3>
              <p className="text-sm text-sidebar-foreground/60">Acompanhe a evolução dos investimentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="lg:hidden mb-4">
              <h1 className="text-3xl font-bold">
                <span className="text-primary">Edu</span>
                <span className="text-secondary">Finance</span>
              </h1>
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "Entrar na conta" : "Criar conta"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Acesse sua plataforma de educação financeira"
                : "Comece sua jornada de educação financeira"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
