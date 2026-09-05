<?php
/**
 * Classe Auth - Autenticação e Autorização
 */

class Auth {
    private $conn;
    private $userClass;

    public function __construct($db) {
        $this->conn = $db;
        $this->userClass = new User($db);
    }

    // Fazer login
    public function login($email, $password) {
        $user = $this->userClass->obterPorEmail($email);

        if (!$user) {
            return ['sucesso' => false, 'mensagem' => 'Utilizador não encontrado'];
        }

        if ($user['status'] !== 'aprovado') {
            return ['sucesso' => false, 'mensagem' => 'A sua conta ainda não foi aprovada. Contacte o administrador.'];
        }

        if (!password_verify($password, $user['password'])) {
            return ['sucesso' => false, 'mensagem' => 'Password incorreta'];
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_nome'] = $user['nome'];
        $_SESSION['user_tipo'] = $user['tipo'];

        return ['sucesso' => true, 'mensagem' => 'Login efectuado com sucesso'];
    }

    public function registar($nome, $email, $password, $tipo, $curso, $nivel_academico) {
        // Verificar se email já existe
        $userTemp = new User($this->conn);
        $userTemp->email = $email;
        if ($userTemp->emailExists()) {
            return ['sucesso' => false, 'mensagem' => 'Este email já está registado'];
        }

        $this->userClass->nome = $nome;
        $this->userClass->email = $email;
        $this->userClass->password = $password;
        $this->userClass->tipo = $tipo;
        $this->userClass->curso = $curso;
        $this->userClass->nivel_academico = $nivel_academico;
        $this->userClass->status = 'pendente';

        if ($this->userClass->criar()) {
            return ['sucesso' => true, 'mensagem' => 'Registo efectuado com sucesso! Aguarde aprovação do administrador.'];
        }

        return ['sucesso' => false, 'mensagem' => 'Erro ao registar. Tente novamente.'];
    }

    // Verificar se utilizador está autenticado
    public static function estaAutenticado() {
        return isset($_SESSION['user_id']);
    }

    // Verificar se utilizador é administrador
    public static function ehAdmin() {
        return isset($_SESSION['user_tipo']) && $_SESSION['user_tipo'] === 'admin';
    }

    // Fazer logout
    public static function logout() {
        session_destroy();
        return true;
    }
}
?>
