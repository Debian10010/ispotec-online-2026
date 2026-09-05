
<?php
/**
 * Classe Chatbot - Integração com Groq Cloud AI
 * Versão Final: Modelo Llama-3.3 & Bypass SSL XAMPP
 */

class Chatbot {
    private $conn;
    private $table_conversations = 'chatbot_conversations';
    private $table_messages = 'chatbot_messages';

    // --- CONFIGURAÇÃO DA API ---
    // Obtenha a chave em https://console.groq.com
    private $apiKey = 'YOUR_GROQ_API_KEY_HERE'; 
    // ---------------------------

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Envia a pergunta para a Groq Cloud API e retorna a resposta
     */
    public function buscarResposta($pergunta) {
        $url = "https://api.groq.com/openai/v1/chat/completions";

        // Prompt do Sistema para definir a personalidade
        $systemPrompt = "Você é um Consultor Académico da Ispotec. Seja prestativo e didático, se possivel sempre que responder ou ajudar procure fazer citacoes e fornecer referencias bibliograficas.";

        $data = [
            "model" => "llama-3.3-70b-versatile", // Modelo atualizado (Llama 3.3)
            "messages" => [
                ["role" => "system", "content" => $systemPrompt],
                ["role" => "user", "content" => $pergunta]
            ],
            "temperature" => 0.7,
            "max_tokens" => 1024
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $this->apiKey,
            "Content-Type: application/json"
        ]);

        // CONFIGURAÇÕES CRÍTICAS PARA FUNCIONAR NO XAMPP (Windows)
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Tratamento de Erros
        if ($response === false) {
            return "Erro de Conexão: " . $curlError;
        }

        $decoded = json_decode($response, true);

        if ($httpCode !== 200) {
            $erroMsg = $decoded['error']['message'] ?? "Erro desconhecido.";
            return "A IA teve um problema (Código $httpCode): " . $erroMsg;
        }

        return $decoded['choices'][0]['message']['content'] ?? "Sem resposta disponível.";
    }

    /**
     * MÉTODOS DE BANCO DE DADOS
     */

    public function criarConversa($user_id) {
        $query = "INSERT INTO " . $this->table_conversations . " (user_id, data_criacao) VALUES (?, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $user_id);
        if ($stmt->execute()) return $this->conn->insert_id;
        return false;
    }

    public function obterConversa($conversation_id, $user_id) {
        $query = "SELECT * FROM " . $this->table_conversations . " WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ii', $conversation_id, $user_id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function adicionarMensagem($conversation_id, $user_id, $tipo, $conteudo) {
        $query = "INSERT INTO " . $this->table_messages . " (conversation_id, user_id, tipo, conteudo, data_criacao) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('iiss', $conversation_id, $user_id, $tipo, $conteudo);
        return $stmt->execute();
    }

    public function listarMensagens($conversation_id) {
        $query = "SELECT * FROM " . $this->table_messages . " WHERE conversation_id = ? ORDER BY data_criacao ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $conversation_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function obterConversasUtilizador($user_id) {
        $query = "SELECT c.*, 
                 (SELECT conteudo FROM " . $this->table_messages . " 
                  WHERE conversation_id = c.id AND tipo = 'pergunta' 
                  ORDER BY data_criacao DESC LIMIT 1) as ultima_pergunta 
                 FROM " . $this->table_conversations . " c 
                 WHERE c.user_id = ? 
                 ORDER BY c.data_criacao DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        return $stmt->get_result();
    }
}
?>