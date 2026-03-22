import { LayoutDashboard, BookOpen, Calculator, History, LogOut, Trophy, LineChart, Wallet, Bot, Lock, BarChart3, UserCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const REQUIRED_LEVEL = 3;

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trilha de Aprendizado", url: "/trilha", icon: BookOpen },
  { title: "Professor FinBot", url: "/chatbot", icon: Bot },
  { title: "Simulador", url: "/simulador", icon: Calculator },
  { title: "Mercado", url: "/mercado", icon: LineChart, requiresLevel: true },
  { title: "Carteira", url: "/carteira", icon: Wallet, requiresLevel: true },
  { title: "Ranking", url: "/ranking", icon: BarChart3 },
  { title: "Perfil", url: "/perfil", icon: UserCircle },
  { title: "Histórico", url: "/historico", icon: History },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const xpInLevel = profile ? profile.xp % 100 : 0;
  const userLevel = profile?.level ?? 0;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6">
        <h1 className="text-xl font-bold">
          <span className="text-sidebar-primary">Edu</span>
          <span className="text-secondary">Finance</span>
        </h1>
        {profile && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-sidebar-foreground/70">Olá, {profile.name || "Estudante"}!</p>
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
              <Trophy className="w-3.5 h-3.5 text-warning" />
              <span>Nível {profile.level}</span>
              <span className="text-sidebar-foreground/40">•</span>
              <span>{profile.xp} XP</span>
            </div>
            <Progress value={xpInLevel} className="h-1.5 bg-sidebar-accent" />
            <p className="text-[10px] text-sidebar-foreground/40">{xpInLevel}/100 XP para o próximo nível</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isLocked = item.requiresLevel && userLevel < REQUIRED_LEVEL;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1">{item.title}</span>
                        {isLocked && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sidebar-foreground/20 text-sidebar-foreground/40 gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Nv.{REQUIRED_LEVEL}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent transition-colors w-full text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
