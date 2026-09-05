<?php
/**
 * Classe Group - Gestão de Grupos/Disciplinas
 */

class Group {
    private $conn;
    private $table = 'groups';

    public $id;
    public $nome;
    public $descricao;
    public $disciplina;
    public $modulo;
    public $criado_por;
    public $data_criacao;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar novo grupo
    public function criar() {
        $query = "INSERT INTO " . $this->table . "
                SET
                    nome = ?,
                    descricao = ?,
                    disciplina = ?,
                    modulo = ?,
                    criado_por = ?,
                    data_criacao = NOW()";

        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            'ssssi',
            $this->nome,
            $this->descricao,
            $this->disciplina,
            $this->modulo,
            $this->criado_por
        );

        return $stmt->execute();
    }

    // Obter grupo por ID
    public function obterPorId($id) {
        $query = "SELECT g.*, u.nome as criador_nome 
                FROM " . $this->table . " g
                LEFT JOIN users u ON g.criado_por = u.id
                WHERE g.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Listar todos os grupos
    public function listarTodos() {
        $query = "SELECT g.*, 
                COUNT(DISTINCT gm.user_id) as total_membros,
                COUNT(DISTINCT p.id) as total_posts
                FROM " . $this->table . " g
                LEFT JOIN group_members gm ON g.id = gm.group_id
                LEFT JOIN posts p ON g.id = p.group_id
                GROUP BY g.id
                ORDER BY g.data_criacao DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Listar grupos do utilizador
    public function listarPorUtilizador($user_id) {
        $query = "SELECT g.*,
                COUNT(DISTINCT gm.user_id) as total_membros,
                COUNT(DISTINCT p.id) as total_posts
                FROM " . $this->table . " g
                INNER JOIN group_members gm ON g.id = gm.group_id
                LEFT JOIN posts p ON g.id = p.group_id
                WHERE gm.user_id = ?
                GROUP BY g.id
                ORDER BY g.data_criacao DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Adicionar utilizador ao grupo
    public function adicionarMembro($group_id, $user_id) {
        $query = "INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $group_id, $user_id);
        return $stmt->execute();
    }

    // Remover utilizador do grupo
    public function removerMembro($group_id, $user_id) {
        $query = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $group_id, $user_id);
        return $stmt->execute();
    }

    // Verificar se utilizador pertence ao grupo
    public function pertenceAoGrupo($group_id, $user_id) {
        $query = "SELECT id FROM group_members WHERE group_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $group_id, $user_id);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }

    // Listar membros do grupo
    public function listarMembros($group_id) {
        $query = "SELECT u.id, u.nome, u.email, u.tipo, gm.data_entrada
                FROM group_members gm
                INNER JOIN users u ON gm.user_id = u.id
                WHERE gm.group_id = ?
                ORDER BY gm.data_entrada DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $group_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Eliminar grupo
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }

    // Atualizar informações do grupo
    public function atualizar() {
        $query = "UPDATE " . $this->table . " 
                SET nome = ?, descricao = ?, disciplina = ?, modulo = ?
                WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ssssi', $this->nome, $this->descricao, $this->disciplina, $this->modulo, $this->id);
        return $stmt->execute();
    }
}
?>
