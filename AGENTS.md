# AGENTS.md - ISPOTEC.ONLINE

## Arquitetura
- **Stack**: PHP 7.4+ puro + MySQL/MariaDB
- **Servidor**: Apache (XAMPP local), sem framework
- **Estrutura**: classes/ (OOP), config/, auth/, dashboard/, profile/, chatbot/

## Comandos
- **Instalar BD**: `mysql -u root < scripts/criar_tabelas.sql`
- **Testar conexão**: Aceder `http://localhost/ispotec.online/test-connection.php`
- **Reset admin**: Reexecutar `scripts/criar_tabelas.sql` (password: Admin123!)

## Convenções de Código
- **Sessão**: Usar `$conn` do header.php (singleton Database)
- **Segurança**: Prepared statements, bcrypt (cost 12), htmlspecialchars()
- **Includes**: Usar dirname(__FILE__) para paths, require_once sempre
- **Nomenclatura**: snake_case para BD, camelCase para métodos PHP

## Estrutura de Ficheiros
- `includes/header.php` - Estilos globais inline, nav, sessão
- `includes/footer.php` - Rodapé e scripts
- `classes/` - Auth.php, User.php, Group.php, Post.php, Portfolio.php, Chatbot.php

## Regras Importantes
- Nunca fechar conexão BD manualmente (singleton)
- Validar $_SESSION['user_id'] antes de operações
- Tipos de utilizador: estudante, docente, especialista (admin)
