<?php
/**
 * Classe ChatMessage - Gestão de Mensagens de Chat
 * Suporta texto, imagens, vídeos, áudios e documentos
 */

class ChatMessage {
    private $conn;
    private $table = 'chat_messages';

    public $id;
    public $user_id;
    public $group_id;
    public $conteudo;
    public $tipo_mensagem;
    public $ficheiro_path;
    public $ficheiro_nome;
    public $ficheiro_tamanho;
    public $data_criacao;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Criar nova mensagem
     */
    public function criar() {
        $query = "INSERT INTO " . $this->table . "
                SET
                    user_id = ?,
                    group_id = ?,
                    conteudo = ?,
                    tipo_mensagem = ?,
                    ficheiro_path = ?,
                    ficheiro_nome = ?,
                    ficheiro_tamanho = ?,
                    data_criacao = NOW()";

        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            'iissssi',
            $this->user_id,
            $this->group_id,
            $this->conteudo,
            $this->tipo_mensagem,
            $this->ficheiro_path,
            $this->ficheiro_nome,
            $this->ficheiro_tamanho
        );

        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }

        return false;
    }

    /**
     * Obter mensagem por ID
     */
    public function obterPorId($id) {
        $query = "SELECT m.*, u.nome, u.foto_perfil, u.tipo as user_tipo
                FROM " . $this->table . " m
                INNER JOIN users u ON m.user_id = u.id
                WHERE m.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    /**
     * Listar mensagens do chat global (últimas primeiras)
     */
    public function listarChatGlobal($limit = 50, $offset = 0) {
        $query = "SELECT m.*, u.nome, u.foto_perfil, u.tipo as user_tipo
                FROM " . $this->table . " m
                INNER JOIN users u ON m.user_id = u.id
                WHERE m.group_id IS NULL
                ORDER BY m.data_criacao DESC
                LIMIT ? OFFSET ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        return $stmt->get_result();
    }

    /**
     * Listar mensagens de um grupo
     */
    public function listarPorGrupo($group_id, $limit = 50, $offset = 0) {
        $query = "SELECT m.*, u.nome, u.foto_perfil, u.tipo as user_tipo
                FROM " . $this->table . " m
                INNER JOIN users u ON m.user_id = u.id
                WHERE m.group_id = ?
                ORDER BY m.data_criacao DESC
                LIMIT ? OFFSET ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('iii', $group_id, $limit, $offset);
        $stmt->execute();
        return $stmt->get_result();
    }

    /**
     * Eliminar mensagem
     */
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $id, $this->user_id);
        return $stmt->execute();
    }

    /**
     * Contar mensagens de um grupo
     */
    public function contarPorGrupo($group_id) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE group_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $group_id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total'];
    }
}
