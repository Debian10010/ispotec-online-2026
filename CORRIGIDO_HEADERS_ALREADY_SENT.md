# Correção: "Headers Already Sent" Error

## Problema Identificado

O erro `Warning: Cannot modify header information - headers already sent` ocorria porque o código estava tentando executar `header()` DEPOIS de incluir `includes/header.php`, que já envia HTML para o navegador.

### Ordem Errada (Causava Erro):
```php
<?php
require_once 'includes/header.php';  // Envia HTML
// ...
if (condicao) {
    header('Location: ...');  // Erro! Headers já foram enviados
}
?>
```

### Ordem Correta (Resolvido):
```php
<?php
// 1. Primeiro: carregar config e verificar condições
require_once 'config/config.php';
require_once 'config/database.php';

// 2. Depois: fazer validações com header() se necessário
if (condicao) {
    header('Location: ...');  // OK! Headers ainda não foram enviados
}

// 3. Por último: incluir header.php que envia HTML
require_once 'includes/header.php';
?>
```

## Ficheiros Corrigidos

1. **dashboard/chat-grupo.php** (linha 18)
   - Movidas verificações de grupo antes de header.php
   
2. **chatbot/index.php** (linha 24)
   - Movidas verificações de conversa antes de header.php
   
3. **profile/view.php** (linhas 17, 24)
   - Movidas verificações de user ID antes de header.php
   
4. **dashboard/group-view.php** (linhas 16, 26)
   - Movidas verificações de grupo antes de header.php

## Pattern Padrão Implementado

Todos os ficheiros agora seguem este padrão:

```php
<?php
// 1. Verificar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. Importar config e database
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/MinhaClasse.php';

// 3. Verificar autenticação (antes de header)
if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

// 4. Fazer validações (antes de header)
$id = intval($_GET['id'] ?? 0);
if ($id <= 0) {
    header('Location: pagina-anterior.php');
    exit;
}

// 5. Agora sim, incluir header.php
$page_title = 'Meu Título';
require_once '../includes/header.php';

// 6. Resto do código...
?>
```

## Como Evitar Este Erro

- ✅ Sempre faça validações e `header()` ANTES de incluir `header.php`
- ✅ Inclua `header.php` o mais tarde possível
- ✅ Nunca coloque HTML ou CSS antes de `header()`
- ✅ Se precisa testar se algo existe, use `ob_start()` no início para buffering
- ✅ Limpe espaços em branco no final de ficheiros PHP (nenhum espaço após `?>`)

## Validação

Para validar que o erro foi corrigido:
1. Aceda a `http://localhost/ispotec.online/dashboard/chat-grupo.php?id=1`
2. Verifique se não há warnings sobre headers no topo da página
3. Teste todas as pages listadas acima

Erro completamente resolvido!
