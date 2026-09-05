<?php
/**
 * Classe FileManager - Gestão de Uploads e Ficheiros
 * Suporta imagens, vídeos, áudios e documentos
 */

class FileManager {
    private $conn;
    private $upload_dir = 'uploads/chat/';
    
    // Extensões permitidas por tipo
    private $allowed_extensions = [
        'imagem' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'video' => ['mp4', 'avi', 'mov', 'mkv', 'flv', 'webm'],
        'audio' => ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
        'documento' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar']
    ];

    // Tamanho máximo (em bytes)
    private $max_sizes = [
        'imagem' => 10485760,      // 10MB
        'video' => 104857600,      // 100MB
        'audio' => 52428800,       // 50MB
        'documento' => 52428800    // 50MB
    ];

    public function __construct($db = null) {
        $this->conn = $db;
        
        // Criar diretório de uploads se não existir
        if (!is_dir($this->upload_dir)) {
            mkdir($this->upload_dir, 0755, true);
        }
    }

    /**
     * Fazer upload de ficheiro
     */
    public function uploadFile($file, $tipo_ficheiro) {
        // Validar tipo
        if (!isset($file['tmp_name']) || !isset($file['name'])) {
            return ['sucesso' => false, 'erro' => 'Ficheiro inválido'];
        }

        // Obter extensão
        $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Validar extensão
        if (!in_array($extensao, $this->allowed_extensions[$tipo_ficheiro] ?? [])) {
            return ['sucesso' => false, 'erro' => 'Tipo de ficheiro não permitido'];
        }

        // Validar tamanho
        if ($file['size'] > $this->max_sizes[$tipo_ficheiro]) {
            $max_mb = $this->max_sizes[$tipo_ficheiro] / 1048576;
            return ['sucesso' => false, 'erro' => "Ficheiro muito grande. Máximo: {$max_mb}MB"];
        }

        // Gerar nome único
        $nome_novo = uniqid() . '_' . bin2hex(random_bytes(4)) . '.' . $extensao;
        $caminho_completo = $this->upload_dir . $nome_novo;

        // Fazer upload
        if (move_uploaded_file($file['tmp_name'], $caminho_completo)) {
            return [
                'sucesso' => true,
                'caminho' => $caminho_completo,
                'nome' => $nome_novo,
                'nome_original' => $file['name'],
                'tamanho' => $file['size'],
                'tipo' => $tipo_ficheiro
            ];
        }

        return ['sucesso' => false, 'erro' => 'Erro ao fazer upload do ficheiro'];
    }

    /**
     * Obter tipo de ficheiro baseado na extensão
     */
    public function obterTipoFicheiro($extensao) {
        $extensao = strtolower($extensao);
        
        foreach ($this->allowed_extensions as $tipo => $ext_array) {
            if (in_array($extensao, $ext_array)) {
                return $tipo;
            }
        }
        
        return 'documento'; // Default
    }

    /**
     * Validar se ficheiro é imagem
     */
    public function isImagem($extensao) {
        return in_array(strtolower($extensao), $this->allowed_extensions['imagem']);
    }

    /**
     * Obter informações de imagem (largura, altura)
     */
    public function getImageDimensions($caminho) {
        if (file_exists($caminho)) {
            $info = @getimagesize($caminho);
            if ($info) {
                return ['largura' => $info[0], 'altura' => $info[1]];
            }
        }
        return ['largura' => 0, 'altura' => 0];
    }

    /**
     * Obter informações de áudio/vídeo (duração aproximada)
     */
    public function getMediaDuration($caminho) {
        // Nota: Requere ffmpeg instalado
        // Esta é uma aproximação básica
        if (file_exists($caminho)) {
            $size = filesize($caminho);
            // Aproximação: assume 500KB/segundo médio
            return (int)($size / 512000);
        }
        return 0;
    }

    /**
     * Eliminar ficheiro
     */
    public function deleteFile($caminho) {
        if (file_exists($caminho)) {
            return unlink($caminho);
        }
        return false;
    }

    /**
     * Obter ícone para tipo de ficheiro
     */
    public function getFileIcon($tipo_ficheiro) {
        $icons = [
            'imagem' => '🖼️',
            'video' => '🎥',
            'audio' => '🎵',
            'documento' => '📄',
            'texto' => '📝'
        ];
        return $icons[$tipo_ficheiro] ?? '📎';
    }

    /**
     * Formatar tamanho de ficheiro para leitura humana
     */
    public function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
