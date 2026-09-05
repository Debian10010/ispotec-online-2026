# ISPOTEC.ONLINE - Guia Completo de Instalação e Uso

## Status Atual do Sistema

✅ **Sistema Completo e Funcional**

Todos os módulos foram criados e testados. O sistema está pronto para uso.

---

## Instalação Rápida (3 passos)

### Passo 1: Extrair Ficheiros
```
C:\xampp\htdocs\ispotec.online\
```

### Passo 2: Executar Instalador
```
http://localhost/ispotec.online/install.php
```

Siga os 4 passos do assistente automático.

### Passo 3: Aceder à Plataforma
```
http://localhost/ispotec.online/
```

**Credenciais de Admin:**
- Email: `admin@ispotec.online`
- Password: `Admin123!`

---

## Estrutura Completa do Sistema

### 📂 Pastas Principais

```
ispotec.online/
├── 📄 index.php              # Página inicial
├── 📄 install.php            # Instalador automático
├── 📄 test-connection.php    # Teste de ligação
│
├── 📁 config/
│   ├── config.php            # Constantes da aplicação
│   ├── database.php          # Configuração MySQL
│   └── .installed            # Flag de instalação
│
├── 📁 classes/               # Lógica da aplicação
│   ├── Database.php          # Conexão MySQL
│   ├── Auth.php              # Autenticação
│   ├── User.php              # Utilizadores
│   ├── Group.php             # Grupos/Disciplinas
│   ├── Post.php              # Publicações
│   ├── Comment.php           # Comentários
│   ├── Portfolio.php         # Portfólio
│   └── Chatbot.php           # Chatbot IA
│
├── 📁 auth/                  # Autenticação
│   ├── login.php             # Formulário de login
│   ├── register.php          # Formulário de registo
│   ├── logout.php            # Terminar sessão
│   ├── check-auth.php        # Middleware autenticação
│   └── check-admin.php       # Middleware admin
│
├── 📁 dashboard/             # Painel de controlo
│   ├── index.php             # Dashboard principal
│   ├── users-pending.php     # Aprovação de contas
│   ├── users-list.php        # Listagem de utilizadores
│   ├── groups-manage.php     # Gerir disciplinas
│   ├── my-groups.php         # Meus grupos
│   ├── group-view.php        # Ver grupo
│   └── feed.php              # Feed social
│
├── 📁 profile/               # Perfil do utilizador
│   ├── index.php             # Meu perfil
│   ├── portfolio-add.php     # Adicionar ao portfólio
│   └── view.php              # Ver perfil público
│
├── 📁 chatbot/               # Chatbot académico
│   └── index.php             # Interface do chatbot
│
├── 📁 includes/              # Includes reutilizáveis
│   ├── header.php            # Cabeçalho
│   └── footer.php            # Rodapé
│
├── 📁 scripts/               # Scripts SQL
│   ├── criar_tabelas.sql     # Criação de BD
│   └── criar_tabelas_chatbot.sql  # Tabelas do chatbot
│
└── 📁 uploads/               # Ficheiros carregados
    └── (criado automaticamente)
```

---

## Fluxo de Utilização

### Para Utilizadores Novos

1. **Registar-se** em `auth/register.php`
   - Preencher dados pessoais
   - Escolher tipo de utilizador (Estudante, Docente, Especialista)
   - Criar password segura

2. **Aguardar Aprovação**
   - Admin aprova em `dashboard/users-pending.php`
   - Receberá confirmação

3. **Fazer Login**
   - Usar email e password
   - Aceder ao dashboard

4. **Explorar Plataforma**
   - Unir-se a grupos em `dashboard/my-groups.php`
   - Criar publicações em `dashboard/group-view.php`
   - Adicionar ao portfólio em `profile/portfolio-add.php`
   - Usar chatbot em `chatbot/index.php`

### Para Administradores

1. **Aprovar Utilizadores**
   - Ir a `dashboard/users-pending.php`
   - Aprovar ou rejeitar contas

2. **Criar Disciplinas**
   - Ir a `dashboard/groups-manage.php`
   - Criar novos grupos/disciplinas

3. **Ver Relatórios**
   - Dashboard mostra estatísticas em tempo real
   - Números de utilizadores, grupos, posts, etc.

---

## Módulos e Funcionalidades

### 🔐 Autenticação (Auth)

**Ficheiros:**
- `auth/login.php` - Login com email/password
- `auth/register.php` - Registar novo utilizador
- `auth/logout.php` - Terminar sessão
- `classes/Auth.php` - Lógica de autenticação

**Funcionalidades:**
- Hash de password com bcrypt (cost 12)
- Validação de email
- Status de aprovação (pendente/aprovado/bloqueado)
- Gestão de tipos de utilizador

**Fluxo:**
```
Utilizador → Register → Status Pendente
                ↓
            Admin Aprova
                ↓
          Utilizador pode fazer Login
```

### 👥 Gestão de Utilizadores (Users)

**Ficheiros:**
- `classes/User.php` - Classe de utilizador
- `dashboard/users-pending.php` - Aprovar contas
- `dashboard/users-list.php` - Listar utilizadores
- `profile/index.php` - Editar perfil

**Tipos de Utilizadores:**
1. **Estudante** - Acesso limitado, pode participar
2. **Docente** - Pode criar material e orientar
3. **Especialista** - Acesso completo, pode moderar
4. **Admin** - Controlo total da plataforma

### 📚 Grupos e Disciplinas (Groups)

**Ficheiros:**
- `classes/Group.php` - Classe de grupo
- `dashboard/groups-manage.php` - Criar grupos (admin)
- `dashboard/my-groups.php` - Entrar/sair de grupos
- `dashboard/group-view.php` - Ver grupo e posts

**Funcionalidades:**
- Criar disciplinas/módulos
- Entrada/saída livre de grupos
- Visualizar membros
- Listar posts do grupo

### 📝 Publicações e Comentários (Posts & Comments)

**Ficheiros:**
- `classes/Post.php` - Classe de publicação
- `classes/Comment.php` - Classe de comentário
- `dashboard/group-view.php` - Interface de posts/comentários
- `dashboard/feed.php` - Feed global

**Tipos de Posts:**
- Discussão
- Material
- Artigo
- Projeto

### 🎓 Portfólio Académico (Portfolio)

**Ficheiros:**
- `classes/Portfolio.php` - Classe de portfólio
- `profile/portfolio-add.php` - Adicionar itens
- `profile/view.php` - Ver portfólio público

**Categorias:**
- Projetos
- Artigos
- Certificados
- Trabalhos

### 🤖 Chatbot Académico (Chatbot)

**Ficheiros:**
- `classes/Chatbot.php` - Lógica do chatbot
- `chatbot/index.php` - Interface conversacional

**Base de Conhecimento:**
- Programação
- Base de Dados
- Contabilidade
- Direito
- Marketing
- Técnicas de Estudo
- E mais...

**Funcionalidades:**
- Resposta inteligente baseada em palavras-chave
- Histórico de conversas por utilizador
- Sugestões de perguntas frequentes

---

## Estrutura de Base de Dados

### Tabelas Principais

#### `users`
```sql
id, nome, email, password, tipo, curso, nivel_academico,
status, data_registo, data_atualizacao
```

#### `groups`
```sql
id, nome, descricao, disciplina, modulo, criado_por, data_criacao
```

#### `group_members`
```sql
id, group_id, user_id, data_entrada
```

#### `posts`
```sql
id, user_id, group_id, conteudo, titulo, tipo, 
data_criacao, data_atualizacao
```

#### `comments`
```sql
id, post_id, user_id, conteudo, data_criacao
```

#### `portfolio`
```sql
id, user_id, titulo, descricao, categoria, ficheiro, data_criacao
```

#### `notifications`
```sql
id, user_id, titulo, mensagem, tipo, lida, data_criacao
```

---

## Segurança Implementada

✅ **Password Hashing**
- Algoritmo: bcrypt
- Cost: 12 (máxima segurança)
- Validação: mínimo 8 caracteres

✅ **SQL Injection Prevention**
- Prepared statements em todas as queries
- Binding de parâmetros

✅ **XSS Prevention**
- Escape com htmlspecialchars()
- Validação de input

✅ **Session Management**
- Verificação de autenticação em cada página protegida
- Middleware check-auth.php
- Timeout de 1 hora (configurável)

✅ **Access Control**
- Middleware check-admin.php para páginas administrativas
- Verificação de tipos de utilizador
- RLS (Row Level Security) através de queries

---

## Resolução de Problemas

### Erro: "Erro de ligação à Base de Dados"

**Solução:**
1. Verificar se MySQL está ligado (XAMPP Control Panel)
2. Confirmar credenciais em `config/database.php`
3. Executar `test-connection.php` para diagnóstico

### Erro: "Classe não encontrada"

**Solução:**
1. Verificar se ficheiro existe em `classes/`
2. Confirmar caminhos em `config/config.php`
3. Verificar permissões de leitura

### Problema: Não consegue fazer login

**Solução:**
1. Verificar se utilizador foi aprovado em `dashboard/users-pending.php`
2. Confirmar password (Admin123! para admin padrão)
3. Verificar se email está correcto

### Problema: Instalação travada

**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Verificar console (F12) para erros JavaScript
3. Reexecute `scripts/criar_tabelas.sql` no phpMyAdmin

---

## Configurações Importantes

### Em `config/config.php`

```php
SITE_URL              // URL da plataforma
SESSION_TIMEOUT       // Tempo de sessão (3600 = 1 hora)
MAX_FILE_SIZE         // Tamanho máximo de upload (10MB)
ITEMS_PER_PAGE        // Itens por página (15)
```

### Em `config/database.php`

```php
$host = 'localhost'              // Host MySQL
$db_name = 'ispotec_online'      // Nome da BD
$user = 'root'                   // Utilizador MySQL
$password = ''                   // Password (vazio para XAMPP)
```

---

## Próximos Passos para Desenvolvimento

### Funcionalidades Futuras
- Sistema de notificações em tempo real (WebSocket)
- Integração OAuth (Google, Microsoft, Facebook)
- API REST para aplicações mobile
- Gamificação (badges, pontos)
- Vídeo conferência integrada
- Sistema de avaliações (ratings)
- Recomendação automática de grupos

### Melhorias de Performance
- Caching com Redis
- Compressão de imagens
- Paginação lazy loading
- Índices de BD otimizados

### Integração Empresarial
- LDAP para autenticação corporativa
- SSO (Single Sign-On)
- Analytics avançado
- Relatórios em PDF/Excel

---

## Suporte e Contato

Para questões técnicas sobre a plataforma ISPOTEC.ONLINE:
- Consulte o README.md
- Execute test-connection.php para diagnóstico
- Verifique logs de erro no phpMyAdmin

---

## Informações do Projeto

- **Nome:** ISPOTEC.ONLINE
- **Versão:** 1.0.0
- **Tipo:** Rede Social Académica
- **Linguagem:** PHP 7.4+
- **Database:** MySQL 5.7+
- **Licença:** Propriedade do ISPOtec

---

**Desenvolvido para o Instituto Superior Politécnico e de Tecnologias (ISPOtec)**

Data: 2024 | Status: ✅ Completo e Funcional
