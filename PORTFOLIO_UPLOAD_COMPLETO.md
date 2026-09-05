# Sistema de Portfólio com Upload de Ficheiros - ISPOTEC.ONLINE

## Resumo das Funcionalidades Implementadas

O sistema de portfólio foi completamente revitalizado com suporte real para upload e gestão de ficheiros académicos.

### 1. Upload Real de Ficheiros (`portfolio-add.php`)

**Funcionalidades:**
- Upload seguro de múltiplos tipos de ficheiros
- Validação de tamanho (máximo 100 MB)
- Suporte a: PDF, DOC, DOCX, IMAGENS, VÍDEOS, EXCEL, POWERPOINT, ZIP, etc.
- Interface com Drag & Drop
- Pré-visualização com ícones personalizados
- Persistência de dados em caso de erro

**Tipos de Ficheiro Suportados:**
```
Documentos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
Imagens: JPG, JPEG, PNG, GIF, BMP
Vídeos: MP4, AVI, MOV, MKV, WEBM
Compactados: ZIP, RAR
```

**Como Usar:**
1. Aceda a `profile/portfolio-add.php`
2. Preencha o título e categoria
3. Clique na área de upload ou arraste um ficheiro
4. Adicione descrição (opcional)
5. Clique em "Adicionar ao Portfólio"

### 2. Visualização de Portfólio (`view.php`)

**Funcionalidades:**
- Pré-visualizações de imagens
- Reprodução de vídeos
- Visualização/download de documentos
- Ícones por tipo de ficheiro
- Links para download direto
- Data de criação dos itens
- Verificação de disponibilidade dos ficheiros

**Tipos de Visualização:**
```
Imagens: Miniatura com visualização fullscreen
Vídeos: Player de vídeo integrado
Documentos: Link para abrir em nova aba ou download
Arquivos: Link direto para download
```

### 3. Melhorias na Classe Portfolio.php

**Novos Métodos:**
- `processarUpload($file)` - Processa e valida upload
- `obterIcono($extensao)` - Retorna ícone baseado no tipo de ficheiro

**Validações:**
- Extensões permitidas em whitelist
- Tamanho máximo: 100 MB
- Nomes de ficheiro únicos e seguros
- Limpeza automática em caso de erro

### 4. Segurança Implementada

- Nomes de ficheiro únicos com timestamp
- Bypass CORS para imagens locais
- Validação de tipos MIME
- Proteção contra sobrescrita de ficheiros
- Remoção automática em caso de erro de BD

## Estrutura de Diretórios

```
uploads/
└── portfolio/
    ├── portfolio_1_1234567890.pdf
    ├── portfolio_2_1234567891.jpg
    ├── portfolio_3_1234567892.mp4
    └── ...
```

## Exemplo de Utilização

### Adicionar Item ao Portfólio:
```php
$portfolio = new Portfolio($conn);
$portfolio->user_id = $_SESSION['user_id'];
$portfolio->titulo = "Meu Projeto";
$portfolio->descricao = "Descrição do projeto...";
$portfolio->categoria = "projeto";
$portfolio->ficheiro = "uploads/portfolio/arquivo.pdf";
$portfolio->criar();
```

### Listar Portfólio:
```php
$result = $portfolio->listarPorUtilizador($user_id);
while ($row = $result->fetch_assoc()) {
    echo $row['titulo'];
}
```

### Obter Ícone:
```php
$icon = $portfolio->obterIcono('pdf'); // Retorna: 📄
```

## Limitações e Considerações

- Máximo 100 MB por ficheiro
- Formatos específicos apenas (whitelist)
- Limpeza manual de ficheiros órfãos recomendada
- Backup regular de uploads recomendado

## Próximas Melhorias Possíveis

- Compressão de imagens automática
- Transcodificação de vídeos
- Versionamento de ficheiros
- Sistema de partilha de portfólios
- Análise de tipos MIME adicional
- Armazenamento em cloud (S3, Azure Blob)

---

**Sistema Pronto para Produção** ✓
