# ISPOTEC.ONLINE - React + Vite SPA

Aplicação web institucional da Rede Social Académica do **Instituto Superior Politécnico e de Tecnologias (ISPOTEC)**, convertida com máxima fidelidade visual, de rotas e comportamental a partir da versão original em PHP para **React + Vite**, totalmente pronta para implantação na **Vercel**.

---

## 1. Como Instalar

Certifique-se de ter o [Node.js](https://nodejs.org/) (v18+ ou superior) instalado.

Execute na raiz do projeto:

```bash
npm install
```

---

## 2. Como Executar Localmente

Inicie o servidor de desenvolvimento Vite:

```bash
npm run dev
```

A aplicação estará acessível em: `http://localhost:3000` (ou na porta atribuída pelo Vite).

---

## 3. Como Construir para Produção

Gere a build estática otimizada para implantação:

```bash
npm run build
```

Os ficheiros estáticos finais serão gerados na pasta `dist/`.

Para pré-visualizar a build de produção localmente:

```bash
npm run preview
```

---

## 4. Como Fazer Deploy na Vercel

O projeto já inclui o ficheiro de configuração `vercel.json` com reescrita SPA (`rewrite` para `/index.html`), garantindo que a navegação direta e o refresh de rotas (`/dashboard`, `/profile`, `/chatbot`, etc.) funcionem sem erro 404.

### Passos de Implantação:
1. Conecte o repositório Git à [Vercel](https://vercel.com).
2. Configure o framework preset como **Vite** (detectado automaticamente).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Install Command: `npm install`
6. Clique em **Deploy**.

---

## 5. Credenciais de Demonstração (Mock)

A autenticação é gerida de forma local através do serviço mock (`authService` com persistência em `localStorage`). Utilize as seguintes credenciais para testar os diferentes papéis do sistema:

### Administrador / Especialista
* **Email:** `admin@ispotec.online`
* **Password:** `Admin123!` (ou `admin123`)

### Docente
* **Email:** `docente@ispotec.online`
* **Password:** `docente123`

### Estudante
* **Email:** `estudante@ispotec.online`
* **Password:** `estudante123`

---

## 6. Estrutura do Projeto

```text
ispotec.online/
├── public/
│   └── assets/
│       └── img/
│           └── logo-ispotec.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header.jsx           # Navegação, dropdown de contactos, menu mobile, WhatsApp
│   │   ├── Footer.jsx           # Rodapé institucional, links SISGA, Moodle, redes sociais
│   │   ├── Layout.jsx           # Estrutura base de página
│   │   └── ProtectedRoute.jsx   # Guarda de rotas protegidas e restrição de administrador
│   ├── context/
│   │   └── AuthContext.jsx      # Estado global de autenticação e sessão do utilizador
│   ├── data/
│   │   ├── users.js             # Utilizadores iniciais e credenciais mock
│   │   ├── groups.js            # Disciplinas e grupos académicos
│   │   ├── posts.js             # Publicações e discussões do feed e grupos
│   │   ├── messages.js          # Histórico de mensagens do chat global e grupos
│   │   ├── chatbot.js           # Base de conhecimento e histórico do chatbot
│   │   ├── portfolio.js         # Trabalhos, certificações e projetos de utilizadores
│   │   └── studyTools.js        # Catálogo de ferramentas IA para estudo
│   ├── pages/
│   │   ├── Home.jsx             # index.php (Hero, destaques, estatísticas, CTA)
│   │   ├── auth/                # Login, Registo, Logout
│   │   ├── dashboard/           # Dashboard, Feed, Gestão de Utilizadores, Grupos, Chats
│   │   ├── chatbot/             # Chatbot Académico e Diretório de IAs
│   │   ├── profile/             # Meu Perfil, Portfólio, Adicionar Item, Perfil Público
│   │   └── users/               # Diretório e pesquisa de utilizadores
│   ├── services/
│   │   ├── authService.js       # Autenticação e sessão
│   │   ├── userService.js       # Gestão de utilizadores e aprovações
│   │   ├── groupService.js      # Gestão de grupos e adesões
│   │   ├── postService.js       # Gestão de publicações e comentários
│   │   ├── chatService.js       # Mensagens em tempo real simuladas
│   │   ├── chatbotService.js    # Consultor académico virtual
│   │   └── portfolioService.js  # Portfólios académicos
│   ├── styles/
│   │   └── global.css           # Estilos globais fiéis ao design original do PHP
│   ├── App.jsx                  # Mapeamento completo de rotas (incluindo aliases .php)
│   └── main.jsx                 # Ponto de entrada React 18
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

## 7. Integração Futura com Backend (Substituição dos Mock Services)

A aplicação foi projetada com estrita separação entre a camada de apresentação (UI) e os serviços de dados.

Para ligar a um backend real (REST API ou GraphQL) posteriormente:
1. Altere as funções na pasta `src/services/` (ex: `authService.js`, `userService.js`, etc.) para realizar chamadas `fetch()` ou `axios.get()` para o seu servidor.
2. A interface e os componentes de páginas não precisam de ser reescritos, pois consomem as mesmas interfaces assíncronas fornecidas pelos serviços.
