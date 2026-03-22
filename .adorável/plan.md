

# 🎓 EduFinance — Plataforma de Educação Financeira e Simulação de Investimentos

## Visão Geral
Uma plataforma web educacional que combina aprendizado gamificado (estilo roadmap), simulação de investimentos e gráficos interativos, desenvolvida como TCC do IFSUL. Backend completo com Supabase (autenticação, banco de dados, persistência).

---

## 🔐 1. Autenticação e Perfil do Usuário
- Tela de **cadastro** e **login** com email/senha via Supabase Auth
- Tabela de perfis com nome, XP, nível e avatar
- Criação automática do perfil ao se cadastrar
- Proteção de rotas (apenas usuários logados acessam o app)

## 🏠 2. Dashboard Principal
- Saudação personalizada com nome do usuário
- Cards resumo: **Nível atual**, **XP total**, **Progresso na trilha (%)**
- Últimas simulações realizadas
- Botões de ação rápida: "Continuar Aprendendo" e "Nova Simulação"
- Badges conquistados em destaque

## 🎯 3. Módulo Educacional — Trilha de Aprendizado (Gamificado)
- Trilha visual com cards em sequência (estilo roadmap)
- Barra de progresso geral da trilha
- Níveis desbloqueáveis (próxima aula só libera ao concluir a anterior)
- **5 aulas iniciais do Módulo "Fundamentos":**
  1. O que é Educação Financeira
  2. O que é Inflação
  3. Juros Simples
  4. Juros Compostos
  5. Risco vs Retorno
- Cada aula contém:
  - Texto explicativo curto com exemplo prático
  - Quiz de 3 perguntas de múltipla escolha
  - Feedback imediato (correto/incorreto com explicação)
  - +20 XP ao concluir
- Sistema de **níveis**: Nível = XP ÷ 100
- Mensagem motivacional ao subir de nível

## 📊 4. Simulador de Investimentos
- Formulário com campos:
  - Tipo de investimento (Ação, FII, Renda Fixa)
  - Valor inicial (R$)
  - Aporte mensal (R$)
  - Tempo (meses/anos)
  - Taxa de retorno anual (%)
- Cálculo com juros compostos + aportes mensais
- Resultados exibidos: valor investido, valor final, lucro, rentabilidade %
- **Indicador visual de risco** (verde/amarelo/vermelho) baseado no tipo de ativo
- Simulação salva automaticamente no banco de dados

## 📈 5. Gráficos Interativos
- Gráfico de evolução mês a mês do investimento simulado (Recharts)
- Gráfico comparativo: **Poupança (6% a.a.) vs Investimento simulado**
- Visual limpo com tooltips ao passar o mouse
- Integração com o simulador (gráfico aparece após simular)

## 🗂️ 6. Histórico de Simulações
- Página "Minhas Simulações" com tabela listando:
  - Tipo, valor inicial, tempo, taxa, valor final, data
- Possibilidade de revisualizar o gráfico de uma simulação anterior

## 🏆 7. Sistema de Gamificação e Badges
- Badges conquistados:
  - "Primeira Aula Concluída"
  - "Primeira Simulação"
  - "Módulo Fundamentos Completo"
- Exibidos no dashboard e no perfil do usuário
- XP e nível persistidos no banco de dados

## 🎨 8. Design e Experiência
- Paleta: **Azul** (confiança) + **Verde** (crescimento financeiro)
- Estilo moderno, minimalista, fintech
- Cards com cantos arredondados, boa tipografia
- Totalmente **responsivo** (mobile + desktop)
- Linguagem simples e acessível para iniciantes
- Navegação lateral (sidebar) com menu: Dashboard, Trilha, Simulador, Histórico

---

## 🗄️ Banco de Dados (Supabase)
- **profiles**: id, nome, xp, nível, avatar
- **lessons**: id, título, conteúdo, ordem, módulo
- **quizzes**: id, lesson_id, pergunta, opções, resposta_correta
- **user_progress**: id, user_id, lesson_id, completada, data
- **simulations**: id, user_id, tipo, valor_inicial, aporte, taxa, tempo, valor_final, data
- **badges**: id, user_id, tipo, data_conquista
- RLS habilitado em todas as tabelas (cada usuário vê apenas seus dados)

