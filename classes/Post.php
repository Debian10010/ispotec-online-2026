<?php
/**
 * Classe Post - Gestão de Publicações e Feed
 */

class Post {
    private $conn;
    private $table = 'posts';

    public $id;
    public $user_id;
    public $group_id;
    public $conteudo;
    public $titulo;
    public $tipo;
    public $data_criacao;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar nova publicação
    public function criar() {
        $query = "INSERT INTO " . $this->table . "
                SET
                    user_id = ?,
                    group_id = ?,
                    titulo = ?,
                    conteudo = ?,
                    tipo = ?,
                    data_criacao = NOW(),
                    data_atualizacao = NOW()";

        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            'iisss',
            $this->user_id,
            $this->group_id,
            $this->titulo,
            $this->conteudo,
            $this->tipo
        );

        return $stmt->execute();
    }

    // Obter post por ID
    public function obterPorId($id) {
        $query = "SELECT p.*, u.nome, u.foto_perfil, u.tipo as user_tipo
                FROM " . $this->table . " p
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Listar publicações por grupo
    public function listarPorGrupo($group_id, $limit = 20, $offset = 0) {
        $query = "SELECT p.*, u.nome, u.foto_perfil, u.tipo as user_tipo,
                COUNT(DISTINCT c.id) as total_comentarios
                FROM " . $this->table . " p
                INNER JOIN users u ON p.user_id = u.id
                LEFT JOIN comments c ON p.id = c.post_id
                WHERE p.group_id = ?
                GROUP BY p.id
                ORDER BY p.data_criacao DESC
                LIMIT ? OFFSET ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('iii', $group_id, $limit, $offset);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Listar publicações do utilizador
    public function listarPorUtilizador($user_id, $limit = 20, $offset = 0) {
        $query = "SELECT p.*, u.nome, u.foto_perfil,
                COUNT(DISTINCT c.id) as total_comentarios
                FROM " . $this->table . " p
                INNER JOIN users u ON p.user_id = u.id
                LEFT JOIN comments c ON p.id = c.post_id
                WHERE p.user_id = ?
                GROUP BY p.id
                ORDER BY p.data_criacao DESC
                LIMIT ? OFFSET ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('iii', $user_id, $limit, $offset);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Feed global
    public function listarFeedGlobal($limit = 20, $offset = 0) {
        $query = "SELECT p.*, u.nome, u.foto_perfil, u.tipo as user_tipo, g.nome as grupo_nome,
                COUNT(DISTINCT c.id) as total_comentarios
                FROM " . $this->table . " p
                INNER JOIN users u ON p.user_id = u.id
                LEFT JOIN groups g ON p.group_id = g.id
                LEFT JOIN comments c ON p.id = c.post_id
                GROUP BY p.id
                ORDER BY p.data_criacao DESC
                LIMIT ? OFFSET ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Eliminar post
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }

    // Atualizar post
    public function atualizar($id, $titulo, $conteudo, $tipo) {
        $query = "UPDATE " . $this->table . " 
                SET titulo = ?, conteudo = ?, tipo = ?, data_atualizacao = NOW()
                WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('sssi', $titulo, $conteudo, $tipo, $id);
        return $stmt->execute();
    }
}
?>
