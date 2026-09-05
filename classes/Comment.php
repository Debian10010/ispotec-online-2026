<?php
/**
 * Classe Comment - Gestão de Comentários
 */

class Comment {
    private $conn;
    private $table = 'comments';

    public $id;
    public $post_id;
    public $user_id;
    public $conteudo;
    public $data_criacao;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar novo comentário
    public function criar() {
        $query = "INSERT INTO " . $this->table . "
                SET
                    post_id = ?,
                    user_id = ?,
                    conteudo = ?,
                    data_criacao = NOW()";

        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            'iis',
            $this->post_id,
            $this->user_id,
            $this->conteudo
        );

        return $stmt->execute();
    }

    // Listar comentários por post
    public function listarPorPost($post_id) {
        $query = "SELECT c.*, u.nome, u.foto_perfil, u.tipo as user_tipo
                FROM " . $this->table . " c
                INNER JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.data_criacao ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $post_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Eliminar comentário
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }
}
?>
