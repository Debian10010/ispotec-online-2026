<?php
/**
 * Classe User - Gestão de Utilizadores
 */

class User {
    private $conn;
    private $table = 'users';

    public $id;
    public $nome;
    public $email;
    public $password;
    public $tipo;
    public $curso;
    public $nivel_academico;
    public $bio;           // Adicionado
    public $foto_perfil;    // Adicionado
    public $status;
    public $data_registo;
    public $data_atualizacao;

    public function __construct($db) {
        $this->conn = $db;
    }

    // --- MÉTODOS DE AUTENTICAÇÃO ---

    // Criar novo utilizador (Registo)
    public function criar() {
        $query = "INSERT INTO " . $this->table . "
                SET nome = ?, email = ?, password = ?, tipo = ?, 
                    curso = ?, nivel_academico = ?, status = ?, 
                    data_registo = NOW(), data_atualizacao = NOW()";

        $stmt = $this->conn->prepare($query);

        // Hash da password (Usando BCRYPT por padrão se as constantes não estiverem definidas)
        $algo = defined('HASH_ALGO') ? HASH_ALGO : PASSWORD_BCRYPT;
        $options = defined('HASH_OPTIONS') ? HASH_OPTIONS : [];
        $hashed_password = password_hash($this->password, $algo, $options);

        $stmt->bind_param('sssssss', 
            $this->nome, $this->email, $hashed_password, $this->tipo, 
            $this->curso, $this->nivel_academico, $this->status
        );

        return $stmt->execute();
    }

    // Login: Verifica credenciais
    public function login($email, $password) {
        $user = $this->obterPorEmail($email);
        
        if ($user && password_verify($password, $user['password'])) {
            // Verificar se a conta está ativa
            if ($user['status'] === 'ativo') {
                return $user;
            } else {
                return "pendente"; // Ou "bloqueado"
            }
        }
        return false;
    }

    // --- MÉTODOS DE CONSULTA ---

    public function emailExists() {
        $query = "SELECT id FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $this->email);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }

    public function obterPorId($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function obterPorEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // --- MÉTODOS DE ATUALIZAÇÃO ---

    // Atualizar Perfil Completo (incluindo Bio e Foto)
    public function atualizarPerfil() {
        $query = "UPDATE " . $this->table . " 
                SET nome = ?, curso = ?, nivel_academico = ?, bio = ?, foto_perfil = ?, data_atualizacao = NOW()
                WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('sssssi', 
            $this->nome, $this->curso, $this->nivel_academico, 
            $this->bio, $this->foto_perfil, $this->id
        );
        
        return $stmt->execute();
    }

    // Atualiza os dados do perfil (método simplificado)
    public function atualizar() {
        $query = "UPDATE " . $this->table . " 
                 SET nome = ?, curso = ?, nivel_academico = ?, bio = ?, 
                     data_atualizacao = NOW()
                 WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ssssi', 
            $this->nome, $this->curso, $this->nivel_academico, 
            $this->bio, $this->id
        );
        
        return $stmt->execute();
    }

    // Atualizar apenas a Password
    public function atualizarPassword($id, $nova_password) {
        $algo = defined('HASH_ALGO') ? HASH_ALGO : PASSWORD_BCRYPT;
        $hashed = password_hash($nova_password, $algo);
        
        $query = "UPDATE " . $this->table . " SET password = ?, data_atualizacao = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('si', $hashed, $id);
        return $stmt->execute();
    }

    // --- MÉTODOS PARA UPLOAD DE FOTO ---

    /**
     * Processa o upload de uma foto
     * @param array $foto Arquivo do $_FILES['foto']
     * @return array ['sucesso' => bool, 'caminho' => string, 'erro' => string]
     */
    public function processarUploadFoto($foto) {
        $diretorioDestino = '../uploads/perfis/';
        
        // Criar diretório se não existir
        if (!file_exists($diretorioDestino)) {
            mkdir($diretorioDestino, 0777, true);
        }

        // Validações
        $erros = $this->validarFoto($foto);
        if (!empty($erros)) {
            return ['sucesso' => false, 'erro' => implode(', ', $erros)];
        }

        // Gerar nome único para o arquivo
        $extensao = pathinfo($foto['name'], PATHINFO_EXTENSION);
        $nomeArquivo = uniqid('perfil_') . '_' . time() . '.' . strtolower($extensao);
        $caminhoCompleto = $diretorioDestino . $nomeArquivo;

        // Mover arquivo
        if (move_uploaded_file($foto['tmp_name'], $caminhoCompleto)) {
            // Caminho relativo para o banco de dados
            $caminhoRelativo = 'uploads/perfis/' . $nomeArquivo;
            return ['sucesso' => true, 'caminho' => $caminhoRelativo, 'erro' => ''];
        }

        return ['sucesso' => false, 'erro' => 'Falha ao mover o arquivo'];
    }

    /**
     * Atualiza apenas a foto de perfil no banco de dados
     * @param string $caminhoFoto Caminho relativo da foto
     * @return bool
     */
    public function atualizarFotoPerfil($caminhoFoto) {
        // Remover foto anterior se existir e não for a padrão
        $usuario = $this->obterPorId($this->id);
        if (!empty($usuario['foto_perfil']) && 
            !str_contains($usuario['foto_perfil'], 'ui-avatars.com') &&
            file_exists('../' . $usuario['foto_perfil'])) {
            unlink('../' . $usuario['foto_perfil']);
        }

        $query = "UPDATE " . $this->table . " 
                 SET foto_perfil = ?, data_atualizacao = NOW()
                 WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('si', $caminhoFoto, $this->id);
        
        return $stmt->execute();
    }

    /**
     * Valida o arquivo de foto
     * @param array $foto
     * @return array Lista de erros
     */
    private function validarFoto($foto) {
        $erros = [];

        // Verificar se há erro no upload
        if ($foto['error'] !== UPLOAD_ERR_OK) {
            $erros[] = $this->traduzirErroUpload($foto['error']);
            return $erros;
        }

        // Verificar tamanho (máximo 5MB)
        $tamanhoMaximo = 5 * 1024 * 1024; // 5MB
        if ($foto['size'] > $tamanhoMaximo) {
            $erros[] = 'A imagem é muito grande. Máximo 5MB permitido.';
        }

        // Verificar tipo de arquivo
        $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $tipoArquivo = mime_content_type($foto['tmp_name']);
        
        if (!in_array($tipoArquivo, $tiposPermitidos)) {
            $erros[] = 'Formato não suportado. Use JPG, PNG ou GIF.';
        }

        // Verificar dimensões (opcional)
        $dadosImagem = getimagesize($foto['tmp_name']);
        if ($dadosImagem) {
            $largura = $dadosImagem[0];
            $altura = $dadosImagem[1];
            
            // Tamanho mínimo recomendado
            if ($largura < 100 || $altura < 100) {
                $erros[] = 'A imagem é muito pequena. Mínimo 100x100 pixels.';
            }
            
            // Tamanho máximo (opcional)
            if ($largura > 4000 || $altura > 4000) {
                $erros[] = 'A imagem é muito grande em resolução.';
            }
        }

        return $erros;
    }

    /**
     * Traduz códigos de erro do upload
     * @param int $codigoErro
     * @return string
     */
    private function traduzirErroUpload($codigoErro) {
        $erros = [
            UPLOAD_ERR_INI_SIZE => 'O arquivo excede o tamanho máximo permitido.',
            UPLOAD_ERR_FORM_SIZE => 'O arquivo excede o tamanho máximo do formulário.',
            UPLOAD_ERR_PARTIAL => 'O upload do arquivo foi feito parcialmente.',
            UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado.',
            UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária não encontrada.',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever o arquivo no disco.',
            UPLOAD_ERR_EXTENSION => 'Uma extensão PHP interrompeu o upload.'
        ];

        return $erros[$codigoErro] ?? 'Erro desconhecido no upload.';
    }

    // --- MÉTODOS ADMINISTRATIVOS ---

    public function listarTodos() {
        $query = "SELECT id, nome, email, tipo, status, data_registo FROM " . $this->table . " ORDER BY nome ASC";
        return $this->conn->query($query);
    }

    public function listarPendentes() {
        $query = "SELECT * FROM " . $this->table . " WHERE status = 'pendente' ORDER BY data_registo DESC";
        return $this->conn->query($query);
    }

    public function atualizarStatus($id, $novo_status) {
        $query = "UPDATE " . $this->table . " SET status = ?, data_atualizacao = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('si', $novo_status, $id);
        return $stmt->execute();
    }

    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }
}
?>