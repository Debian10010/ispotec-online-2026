<?php
/**
 * ISPOTEC.ONLINE - Database Connection
 * Sistema de Rede Social Académica Institucional
 */

class Database {
    private $connection;
    private $host = 'localhost';
    private $db_name = 'ispotec_online';
    private $user = 'root';
    private $password = '';
    private $charset = 'utf8mb4';

    public function __construct() {
        $this->connection = new mysqli(
            $this->host,
            $this->user,
            $this->password,
            $this->db_name
        );

        if ($this->connection->connect_error) {
            die('Erro de ligação à Base de Dados: ' . $this->connection->connect_error);
        }

        $this->connection->set_charset($this->charset);
    }

    public function connect() {
        return $this->connection;
    }

    public function closeConnection() {
        if ($this->connection && $this->connection->ping()) {
            $this->connection->close();
        }
    }

    public function __destruct() {
        if ($this->connection && $this->connection->ping()) {
            @$this->connection->close();
        }
    }
}
?>
