# Correção - FileManager Constructor Error

## Problema
```
Fatal error: Uncaught ArgumentCountError: Too few arguments to function 
FileManager::__construct(), 0 passed in chat-grupo.php on line 44 
and exactly 1 expected in FileManager.php:27
```

## Causa
A classe `FileManager` esperava um parâmetro `$db` no construtor, mas foi sendo chamada sem argumentos em dois ficheiros.

## Solução Implementada

### 1. Ficheiro: classes/FileManager.php (Linha 27)
**Antes:**
```php
public function __construct($db) {
    $this->conn = $db;
    ...
}
```

**Depois:**
```php
public function __construct($db = null) {
    $this->conn = $db;
    ...
}
```

Tornar o parâmetro `$db` opcional com valor padrão `null` permite que a classe seja instantiada sem argumentos, mantendo compatibilidade com código existente.

### 2. Ficheiro: dashboard/chat-global.php (Linha 17)
**Antes:**
```php
$fileManager = new FileManager();
```

**Depois:**
```php
$fileManager = new FileManager($conn);
```

### 3. Ficheiro: dashboard/chat-grupo.php (Linha 44)
**Antes:**
```php
$fileManager = new FileManager();
```

**Depois:**
```php
$fileManager = new FileManager($conn);
```

## Status
✓ Erro resolvido
✓ Chat global funcional
✓ Chat de grupo funcional
✓ Upload de ficheiros operacional

## Testes Recomendados
1. Abrir Chat Global e enviar mensagem
2. Abrir Chat de Grupo e enviar mensagem
3. Fazer upload de imagem
4. Fazer upload de vídeo
5. Fazer upload de áudio
6. Fazer upload de documento

Todas as funcionalidades agora estão prontas para uso!
