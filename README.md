# 🎓 EduFinance - Educação Financeira Gamificada

![Versão](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

EduFinance é uma plataforma inovadora de educação financeira projetada para transformar o aprendizado complexo sobre investimentos em uma jornada intuitiva, divertida e eficaz. Inspirada em modelos de gamificação de sucesso, a plataforma combina teoria, prática simulada e suporte de Inteligência Artificial.

---

## ✨ Funcionalidades Principais

- **🧩 Trilhas de Conhecimento**: Aulas curtas e interativas estilo "Duolingo", organizadas por níveis de dificuldade.
- **📊 Simulador de Investimentos**: Ferramenta poderosa para projetar rendimentos reais baseados em aportes mensais, taxas de retorno e tempo.
- **🤖 Professor FinBot**: Assistente de IA integrado para tirar dúvidas sobre o mercado financeiro em tempo real.
- **📈 Dashboard Interativo**: Visualize a evolução do seu patrimônio, conquistas e progresso nas trilhas.
- **🏆 Sistema de Ranking e XP**: Compita com outros usuários e ganhe XP ao completar lições e desafios.
- **🌓 Modo Escuro/Claro**: Interface moderna com suporte completo a temas dinâmicos.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Gerenciamento de Estado**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Navegação**: [React Router DOM](https://reactrouter.com/)

---

## 📁 Estrutura do Projeto

O projeto utiliza uma organização de diretórios em português para facilitar o desenvolvimento local:

```text
src/
├── Componentes/          # Componentes reutilizáveis de UI
├── páginas/              # Páginas principais da aplicação
├── ganchos/              # Custom Hooks (useAuth, usePortfolio, etc.)
├── Integrações_Supabase/ # Configurações e tipos do cliente Supabase
├── Lib/                 # Utilitários e configurações globais
└── App.tsx              # Roteamento e provedores globais
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (recomendado v18+)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/YgorBDev/Edufinance.git
cd Edufinance
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Supabase:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:8080`.

---

## 📄 Licença

Este projeto é de uso privado e educacional. Todos os direitos reservados.

---

Desenhado com ❤️ por **YgorBDev**.
