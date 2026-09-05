# ISPOTEC.ONLINE - Guia de Boas Práticas

## 1. Estrutura de Código PHP

### Sempre Usar Prepared Statements
```php
// ✓ CORRETO
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

// ✗ ERRADO
$query = "SELECT * FROM users WHERE email = '$email'"; // SQL Injection!
$result = $conn->query($query);
```

### Sempre Usar htmlspecialchars() para Output
```php
// ✓ CORRETO
echo htmlspecialchars($user_input);

// ✗ ERRADO
echo $user_input; // XSS vulnerability!
```

### Usar a Conexão Global $conn
```php
// ✓ CORRETO - No ficheiro depois de require_once '../includes/header.php'
$user = new User($conn);

// ✗ ERRADO
$database = new Database();
$conn = $database->connect();
// Causa: múltiplas instâncias, problemas de fechamento
```

## 2. Gestão de Ficheiros

### Estrutura de Pastas
```
/classes      - Todas as classes de negócio
/auth         - Ficheiros de autenticação
/dashboard    - Páginas de utilizador
/profile      - Gestão de perfis
/users        - Diretório e pesquisa
/chatbot      - Sistema de chatbot
/includes     - Header, footer, componentes reutilizáveis
/config       - Configurações e database
/scripts      - Scripts SQL e utilitários
```

### Naming Convention
- Ficheiros: kebab-case ou snake_case
  - `my-groups.php`, `chat-global.php`
- Variáveis: camelCase
  - `$userEmail`, `$groupId`
- Constantes: UPPER_SNAKE_CASE
  - `SITE_URL`, `APP_NAME`
- Classes: PascalCase
  - `class User {}`, `class Database {}`

## 3. Segurança

### Authentication
- Sempre verificar `$_SESSION['user_id']` antes de operações
- Usar `require_once '../auth/check-auth.php'` em páginas protegidas
- Usar `require_once '../auth/check-admin.php'` em páginas de admin

### Data Validation
```php
// ✓ CORRETO
$id = intval($_GET['id'] ?? 0);
if ($id <= 0) {
    header('Location: index.php');
    exit;
}

// ✗ ERRADO
$id = $_GET['id']; // Pode ser string!
```

### Password Hashing
```php
// ✓ CORRETO
$hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// ✗ ERRADO
$hashed = md5($password); // Inseguro!
$hashed = sha1($password); // Inseguro!
```

## 4. Banco de Dados

### Tipos de Dados Corretos
```sql
-- ✓ CORRETO
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('estudante', 'docente', 'especialista') NOT NULL
);

-- ✗ ERRADO
CREATE TABLE users (
    id int,  -- Sem AUTO_INCREMENT
    nome varchar(100),  -- Muito pequeno
    email varchar(100),  -- Pode não caber
    password text,  -- Muito grande
    tipo varchar(255)  -- Sem ENUM
);
```

### Índices para Performance
```sql
-- Adicionar índices em colunas usadas frequentemente em WHERE
ALTER TABLE posts ADD INDEX idx_user_id (user_id);
ALTER TABLE comments ADD INDEX idx_post_id (post_id);
ALTER TABLE users ADD UNIQUE INDEX idx_email (email);
```

## 5. Tratamento de Erros

### Mostrar Erro Apropriado
```php
// ✓ CORRETO
if (!$stmt) {
    die('Erro na preparação da query: ' . $conn->error);
}

// ✗ ERRADO
// Sem mensagem de erro, deixa utilizador confuso

// ✗ ERRADO (Expõe informação sensível)
if (!$stmt) {
    die('Query: ' . $query . ' Error: ' . $conn->error);
}
```

## 6. Performance

### Usar LIMIT em Queries
```php
// ✓ CORRETO
$query = "SELECT * FROM posts LIMIT 20";

// ✗ ERRADO
$query = "SELECT * FROM posts"; // Pode carregar 10,000 registos!
```

### Evitar N+1 Queries
```php
// ✗ ERRADO - N+1 Problema
$groups = $conn->query("SELECT * FROM groups");
foreach ($groups as $group) {
    $members = $conn->query("SELECT * FROM group_members WHERE group_id = {$group['id']}");
    // Executa 1 + N queries!
}

// ✓ CORRETO - JOIN
$query = "SELECT g.*, COUNT(gm.id) as members FROM groups g 
          LEFT JOIN group_members gm ON g.id = gm.group_id 
          GROUP BY g.id";
```

## 7. Versionamento e Deploy

### Incrementar Versão
```php
define('APP_VERSION', '1.0.1'); // Major.Minor.Patch
```

### Script de Migração
```sql
-- scripts/alter_tabelas_v2.sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE posts ADD INDEX idx_created_at (created_at);
```

Execute scripts na ordem de versão.

## 8. Logging

### Registar Ações Importantes
```php
// ✓ CORRETO
$log = date('Y-m-d H:i:s') . " - User {$_SESSION['user_id']} " . 
       "criou post: {$post_id}\n";
file_put_contents('logs/actions.log', $log, FILE_APPEND);
```

## 9. Código Limpo

### Sempre Documentar Funções
```php
/**
 * Criar novo utilizador na base de dados
 * 
 * @param string $nome Nome do utilizador
 * @param string $email Email único
 * @param string $password Password (vai ser hasheada)
 * @return bool true se sucesso, false se falhou
 */
public function criar($nome, $email, $password) {
    // ...
}
```

### Evitar Magic Numbers
```php
// ✓ CORRETO
define('PASSWORD_MIN_LENGTH', 8);
if (strlen($password) < PASSWORD_MIN_LENGTH) {
    // ...
}

// ✗ ERRADO
if (strlen($password) < 8) {
    // Onde vem o 8?
}
```

## 10. Testes Manuais Antes de Produção

Checklist antes de fazer deploy:
- [ ] Todos os formulários validam input
- [ ] Sem console.log() ou var_dump() no código
- [ ] Sem comentários de debug deixados
- [ ] SQL queries otimizadas com índices
- [ ] Passwords hasheadas corretamente
- [ ] Verificação de permissões em cada página
- [ ] Mensagens de erro amigáveis ao utilizador
- [ ] Redirecionamentos funcionam
- [ ] Links não contêm URLs hardcoded (usar SITE_URL)
- [ ] Todos os ficheiros têm header.php e footer.php

---
**Última atualização:** 2026-01-15
**Autor:** Sistema ISPOTEC.ONLINE
