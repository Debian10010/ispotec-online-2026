# Sistema de Upload de Média - ISPOTEC Online

## Descrição

Sistema completo de upload e compartilhamento de ficheiros no chat de grupos e chat global. Permite que os utilizadores compartilhem:

- **Imagens**: JPG, PNG, GIF, WebP (até 10 MB)
- **Vídeos**: MP4, AVI, MOV, MKV, WebM (até 100 MB)
- **Áudios**: MP3, WAV, OGG, M4A, AAC (até 50 MB)
- **Documentos**: PDF, Word, Excel, PowerPoint, TXT, ZIP (até 50 MB)

## Instalação Passo a Passo

### 1. Abrir o Instalador
```
http://localhost/ispotec.online/install-media.php
```

### 2. Clicar em "Instalar Sistema de Média"
O sistema irá criar automaticamente:
- Tabela `chat_messages` (com suporte a ficheiros)
- Tabela `chat_files` (metadados de ficheiros)
- Pasta `uploads/chat/` (armazenamento de ficheiros)

### 3. Verificar Instalação
- Pasta `uploads/chat/` criada com permissões 755
- Tabelas criadas no banco de dados MySQL

## Ficheiros Adicionados

### Classes PHP

#### `classes/FileManager.php`
Classe responsável por:
- Validar tipos de ficheiro
- Verificar tamanhos máximos
- Fazer upload de ficheiros
- Gerar nomes únicos e seguros
- Obter informações de imagens/vídeos
- Formatar tamanhos de ficheiro

**Métodos principais:**
```php
uploadFile($file, $tipo_ficheiro)     // Fazer upload
obterTipoFicheiro($extensao)          // Determinar tipo
formatFileSize($bytes)                 // Formatar tamanho
getFileIcon($tipo_ficheiro)           // Obter ícone
```

#### `classes/ChatMessage.php`
Classe para gerenciar mensagens de chat:
- Criar mensagens com ou sem ficheiro
- Listar mensagens de grupo
- Listar mensagens de chat global
- Eliminar mensagens

**Métodos principais:**
```php
criar()                               // Criar nova mensagem
obterPorId($id)                      // Obter mensagem específica
listarChatGlobal($limit, $offset)    // Listar chat global
listarPorGrupo($group_id, $limit, $offset)  // Listar chat de grupo
```

### Páginas Implementadas

#### `dashboard/chat-global.php` (Melhorado)
- Suporte a upload de ficheiros
- Visualização de imagens inline
- Reprodução de vídeos integrada
- Reprodução de áudios integrada
- Download de documentos
- Preview de ficheiro antes de envio

#### `dashboard/chat-grupo.php` (Novo)
- Chat específico por grupo
- Mesmas funcionalidades do chat global
- Visualização de membros do grupo
- Links para perfis dos membros

### Estrutura de Banco de Dados

#### Tabela: `chat_messages`
```sql
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT,
    conteudo TEXT,
    tipo_mensagem ENUM('texto', 'imagem', 'video', 'audio', 'documento'),
    ficheiro_path VARCHAR(255),
    ficheiro_nome VARCHAR(255),
    ficheiro_tamanho INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `chat_files`
Armazena metadados adicionais de ficheiros (duração, dimensões, etc)

## Uso

### Chat Global
1. Aceder a `dashboard/chat-global.php` ou Dashboard → Chat Global
2. Digitar mensagem (opcional)
3. Clicar no ícone 📎 para selecionar ficheiro
4. Clicar "Enviar"

### Chat de Grupo
1. Abrir um grupo em `dashboard/my-groups.php`
2. Clicar botão "💬 Abrir Chat"
3. Enviar mensagens e ficheiros como no chat global

## Funcionalidades

### Validações de Segurança
- ✅ Extensões de ficheiro brancas
- ✅ Tamanho máximo por tipo
- ✅ Nomes de ficheiro sanitizados
- ✅ Nomes únicos gerados (uniqid + random_bytes)
- ✅ Verificação de ficheiro existe antes de acesso

### Visualização de Média
- **Imagens**: Visualização inline com CSS `max-width: 100%; max-height: 300px`
- **Vídeos**: Tag `<video>` com controles nativos do navegador
- **Áudios**: Tag `<audio>` com controles nativos
- **Documentos**: Link de download com ícone e tamanho

### Armazenamento
- Pasta: `uploads/chat/`
- Nomes: `uniqid_randomhex.extensão`
- Permissões: 755 para acesso HTTP
- Organização: Um nível apenas (sem subpastas)

## Configuração Avançada

### Alterar Limites de Tamanho
Em `classes/FileManager.php`, linha 21-26:
```php
private $max_sizes = [
    'imagem' => 10485760,      // Altere conforme necessário
    'video' => 104857600,      
    'audio' => 52428800,       
    'documento' => 52428800    
];
```

### Alterar Pasta de Upload
Em `classes/FileManager.php`, linha 10:
```php
private $upload_dir = 'uploads/chat/';  // Altere aqui
```

### Adicionar Novas Extensões
Em `classes/FileManager.php`, linha 14-18:
```php
private $allowed_extensions = [
    'imagem' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],  // Adicione aqui
    // ...
];
```

## Troubleshooting

### "Erro ao fazer upload do ficheiro"
- Verificar permissões da pasta `uploads/chat/` (755)
- Verificar permissões de escrita para o PHP
- Verificar espaço em disco disponível

### "Tipo de ficheiro não permitido"
- Extensão não está na lista branca
- Usar `install-media.php` para verificar tipos suportados

### "Ficheiro muito grande"
- Ficheiro excede limite de tamanho
- Comprimir ficheiro ou usar tamanho menor
- Alterar `$max_sizes` em `FileManager.php` se necessário

### Ficheiros não aparecem após upload
- Verificar se `uploads/chat/` foi criada
- Verificar se tabela `chat_messages` foi criada
- Verificar permissões de ficheiro (644 após upload)

## Próximas Melhorias Sugeridas

- [ ] Compressão automática de imagens
- [ ] Extração de duração de vídeos/áudios (ffmpeg)
- [ ] Pré-visualização de documentos PDF
- [ ] Compartilhamento de ficheiros em posts (além de chat)
- [ ] Limpeza automática de ficheiros antigos
- [ ] Estatísticas de armazenamento
- [ ] API de upload via drag-and-drop

## Segurança

O sistema implementa:
- ✅ Validação de extensão de ficheiro
- ✅ Validação de tipo MIME (opcional, implementar se necessário)
- ✅ Sanitização de nomes de ficheiro
- ✅ Nomes únicos para evitar sobrescrita
- ✅ Limite de tamanho por tipo
- ✅ Verificação de ficheiro existe antes de acesso
- ✅ Escape de HTML em nomes e conteúdo
- ✅ Verificação de permissão de utilizador antes de acesso

## Suporte

Para dúvidas ou problemas:
1. Verificar `MEDIA_UPLOAD_SETUP.md` (este ficheiro)
2. Verificar `install-media.php` para verificar instalação
3. Verificar permissões de pasta e ficheiros
4. Verificar logs de erro do PHP
