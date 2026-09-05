<?php
/**
 * Classe Portfolio - Gestão de Portfólios Académicos com Upload de Ficheiros
 */

class Portfolio {
    private $conn;
    private $table = 'portfolio';
    private $upload_dir = 'uploads/portfolio/';
    private $max_file_size = 104857600; // 100 MB
    private $allowed_extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'mp4', 'avi', 'mov', 'mkv', 'webm', 'txt', 'zip', 'rar'];

    public $id;
    public $user_id;
    public $titulo;
    public $descricao;
    public $categoria;
    public $ficheiro;
    public $tipo_ficheiro;
    public $tamanho_ficheiro;
    public $data_criacao;

    public function __construct($db) {
        $this->conn = $db;
        
        // Criar diretório se não existir
        if (!is_dir($this->upload_dir)) {
            mkdir($this->upload_dir, 0755, true);
        }
    }

    // Upload de ficheiro
    public function processarUpload($file) {
        if (empty($file['tmp_name'])) {
            return ['sucesso' => false, 'erro' => 'Nenhum ficheiro selecionado'];
        }

        // Validar tamanho
        if ($file['size'] > $this->max_file_size) {
            return ['sucesso' => false, 'erro' => 'Ficheiro muito grande (máximo 100 MB)'];
        }

        $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extensao, $this->allowed_extensions)) {
            return ['sucesso' => false, 'erro' => 'Formato de ficheiro não permitido'];
        }

        // Gerar nome único
        $nome_arquivo = 'portfolio_' . $this->conn->real_escape_string($_SESSION['user_id']) . '_' . time() . '.' . $extensao;
        $caminho_arquivo = $this->upload_dir . $nome_arquivo;

        // Mover ficheiro
        if (!move_uploaded_file($file['tmp_name'], $caminho_arquivo)) {
            return ['sucesso' => false, 'erro' => 'Erro ao fazer upload do ficheiro'];
        }

        return [
            'sucesso' => true,
            'caminho' => $caminho_arquivo,
            'nome_original' => $file['name'],
            'tamanho' => $file['size'],
            'tipo' => $extensao
        ];
    }

    // Criar novo item no portfólio
    public function criar() {
        $query = "INSERT INTO " . $this->table . "
                SET
                    user_id = ?,
                    titulo = ?,
                    descricao = ?,
                    categoria = ?,
                    ficheiro = ?,
                    data_criacao = NOW()";

        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            'issss',
            $this->user_id,
            $this->titulo,
            $this->descricao,
            $this->categoria,
            $this->ficheiro
        );

        return $stmt->execute();
    }

    // Listar portfólio por utilizador
    public function listarPorUtilizador($user_id) {
        $query = "SELECT * FROM " . $this->table . " 
                WHERE user_id = ?
                ORDER BY data_criacao DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Obter item do portfólio
    public function obterPorId($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Eliminar item do portfólio
    public function eliminar($id) {
        $item = $this->obterPorId($id);
        if ($item && file_exists($item['ficheiro'])) {
            unlink($item['ficheiro']);
        }
        
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }

    // Obter tipo de ícone baseado na extensão
    public function obterIcono($extensao) {
        $extensao = strtolower($extensao);
        
        if (in_array($extensao, ['jpg', 'jpeg', 'png', 'gif', 'bmp'])) return '🖼️';
        if (in_array($extensao, ['mp4', 'avi', 'mov', 'mkv', 'webm'])) return '🎥';
        if ($extensao === 'pdf') return '📄';
        if (in_array($extensao, ['doc', 'docx'])) return '📝';
        if (in_array($extensao, ['xls', 'xlsx'])) return '📊';
        if (in_array($extensao, ['ppt', 'pptx'])) return '🎯';
        if (in_array($extensao, ['zip', 'rar'])) return '📦';
        
        return '📎';
    }
}
?>
