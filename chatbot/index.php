<?php
/**
 * Chatbot Académico - Layout moderno e responsivo
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/Chatbot.php';

if (!isset($_SESSION['user_id'])) { header('Location: ../auth/login.php'); exit; }

$chatbot = new Chatbot($conn);
$conversation_id = intval($_GET['conv'] ?? 0);

if ($conversation_id <= 0) {
    $conversation_id = $chatbot->criarConversa($_SESSION['user_id']);
    header("Location: index.php?conv=$conversation_id");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty(trim($_POST['pergunta']))) {
    $pergunta = trim($_POST['pergunta']);
    $chatbot->adicionarMensagem($conversation_id, $_SESSION['user_id'], 'pergunta', $pergunta);
    $resposta = $chatbot->buscarResposta($pergunta);
    $chatbot->adicionarMensagem($conversation_id, $_SESSION['user_id'], 'resposta', $resposta);
    header("Location: index.php?conv=$conversation_id");
    exit;
}

$mensagens = $chatbot->listarMensagens($conversation_id);
$conversas = $chatbot->obterConversasUtilizador($_SESSION['user_id']);

$page_title = 'Chatbot Académico';
require_once '../includes/header.php'; 
?>

<style>
    .chatbot-container {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1rem;
        height: calc(100vh - 200px);
        min-height: 500px;
        max-width: 1100px;
        margin: 0 auto;
    }
    
    /* Sidebar */
    .chatbot-sidebar {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .sidebar-header {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    .new-chat-btn {
        display: block;
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, var(--accent-green), #059669);
        color: white;
        border: none;
        border-radius: var(--radius-sm);
        font-weight: 600;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    .new-chat-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .conv-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
    }
    .conv-item {
        display: block;
        padding: 0.75rem 1rem;
        margin-bottom: 0.25rem;
        border-radius: var(--radius-sm);
        text-decoration: none;
        color: var(--text-dark);
        font-size: 0.85rem;
        transition: all 0.2s;
    }
    .conv-item:hover {
        background: var(--light-gray);
    }
    .conv-item.active {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: var(--secondary-blue);
        font-weight: 500;
    }
    .conv-item strong {
        display: block;
        font-size: 0.8rem;
        margin-bottom: 0.15rem;
    }
    .conv-item small {
        color: var(--text-muted);
        font-size: 0.75rem;
    }
    .conv-item.active small {
        color: var(--secondary-blue);
        opacity: 0.8;
    }
    
    /* Main Chat */
    .chatbot-main {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .chat-header {
        padding: 1rem 1.25rem;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .chat-header .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }
    .chat-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
    }
    .chat-header p {
        margin: 0;
        font-size: 0.8rem;
        opacity: 0.85;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem;
        background: linear-gradient(to bottom, #faf5ff, #f5f3ff);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .bubble {
        max-width: 80%;
        padding: 0.85rem 1.1rem;
        border-radius: 1.25rem;
        font-size: 0.9rem;
        line-height: 1.5;
        position: relative;
        animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .bubble.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        border-bottom-right-radius: 4px;
    }
    .bubble.bot {
        align-self: flex-start;
        background: white;
        color: var(--text-dark);
        border: 1px solid var(--border-color);
        border-bottom-left-radius: 4px;
        box-shadow: var(--shadow-sm);
    }
    .bubble .time {
        display: block;
        font-size: 0.65rem;
        margin-top: 0.4rem;
        opacity: 0.7;
        text-align: right;
    }
    
    .empty-chat {
        text-align: center;
        color: var(--text-muted);
        padding: 3rem;
    }
    .empty-chat .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    .empty-chat h3 {
        margin: 0 0 0.5rem;
        color: var(--text-dark);
    }
    .suggestions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
    }
    .suggestion-btn {
        padding: 0.5rem 1rem;
        background: var(--light-gray);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        font-size: 0.8rem;
        color: var(--text-dark);
        cursor: pointer;
        transition: all 0.2s;
    }
    .suggestion-btn:hover {
        background: #6366f1;
        color: white;
        border-color: #6366f1;
    }
    
    .chat-input-area {
        padding: 1rem;
        background: white;
        border-top: 1px solid var(--border-color);
    }
    .loading-indicator {
        display: none;
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
        padding-left: 0.5rem;
    }
    .loading-indicator.active {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .loading-indicator::before {
        content: '';
        width: 16px;
        height: 16px;
        border: 2px solid var(--border-color);
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .input-row {
        display: flex;
        gap: 0.5rem;
    }
    .input-row input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 25px;
        font-size: 0.95rem;
    }
    .input-row input:focus {
        outline: none;
        border-color: #6366f1;
    }
    .input-row button {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .input-row button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .back-link {
        display: none;
        padding: 0.5rem 1rem;
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.85rem;
    }
    
    /* Mobile Toggle */
    .toggle-sidebar-btn {
        display: none;
        position: fixed;
        bottom: 100px;
        left: 1rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #6366f1;
        color: white;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        z-index: 100;
    }
    
    @media (max-width: 768px) {
        .chatbot-container {
            grid-template-columns: 1fr;
            height: calc(100vh - 180px);
        }
        .chatbot-sidebar {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            z-index: 200;
            border-radius: 0;
        }
        .chatbot-sidebar.active {
            display: flex;
        }
        .toggle-sidebar-btn {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .back-link {
            display: block;
        }
        .bubble {
            max-width: 90%;
        }
    }
</style>

<div class="container">
    <a href="../dashboard/" class="back-link">← Voltar ao Dashboard</a>
    
    <div class="chatbot-container">
        <aside class="chatbot-sidebar" id="sidebar">
            <div class="sidebar-header">
                <a href="index.php?conv=0" class="new-chat-btn">+ Novo Chat</a>
            </div>
            <div class="conv-list">
                <?php while ($c = $conversas->fetch_assoc()): ?>
                    <a href="index.php?conv=<?php echo $c['id']; ?>" 
                       class="conv-item <?php echo $c['id'] == $conversation_id ? 'active' : ''; ?>">
                        <strong>💬 Chat #<?php echo $c['id']; ?></strong>
                        <small><?php echo htmlspecialchars(substr($c['ultima_pergunta'] ?? 'Nova conversa', 0, 30)); ?>...</small>
                    </a>
                <?php endwhile; ?>
            </div>
        </aside>

        <main class="chatbot-main">
            <div class="chat-header">
                <div class="avatar">🤖</div>
                <div>
                    <h2>Assistente ISPOTEC</h2>
                    
                    <p>Tire suas dúvidas académicas</p>
                </div>
            </div>
            
            <div class="chat-messages" id="chatBox">
                <?php 
                $hasMessages = false;
                while ($m = $mensagens->fetch_assoc()): 
                    $hasMessages = true;
                ?>
                    <div class="bubble <?php echo $m['tipo'] === 'pergunta' ? 'user' : 'bot'; ?>">
                        <?php echo nl2br(htmlspecialchars($m['conteudo'])); ?>
                        <span class="time"><?php echo date('H:i', strtotime($m['data_criacao'])); ?></span>
                    </div>
                <?php endwhile; ?>
                
               <?php if (!$hasMessages): ?>
    <div class="empty-chat">
        <div class="icon">📚</div>
        <h3>Olá! Sou o Assistente Académico de Estudos do ISPOTEC</h3>
        <p>
            Posso ajudar-te a compreender matérias, organizar os teus estudos,
            aprender técnicas de estudo e apoiar em diferentes Áreas Académicas.
        </p>

        <div class="suggestions">
            <button class="suggestion-btn" onclick="askQuestion('Ajuda-me a entender esta matéria')">
                Entender a matéria
            </button>

            <button class="suggestion-btn" onclick="askQuestion('Quais são as melhores técnicas de estudo?')">
                Técnicas de estudo
            </button>

            <button class="suggestion-btn" onclick="askQuestion('Como posso estudar melhor para exames?')">
                Preparação para exames
            </button>

            <button class="suggestion-btn" onclick="askQuestion('Ajuda-me a criar um plano de estudo')">
                Plano de estudo
            </button>

            <button class="suggestion-btn" onclick="askQuestion('Explica esta matéria de forma simples')">
                Explicação simplificada
            </button>
        </div>
    </div>
    
<?php endif; ?>


            <div class="chat-input-area">
                <div class="loading-indicator" id="loader">A pensar...</div>
                <form method="POST" class="input-row" id="chatForm" onsubmit="showLoader()">
                    <input type="text" name="pergunta" id="perguntaInput" placeholder="Escreva sua dúvida..." required autocomplete="off">
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </main>
    </div>
    
    <button class="toggle-sidebar-btn" onclick="toggleSidebar()">📋</button>
</div>
<div class="container mt-4 text-center">
    <a href="ias_estudo.php" 
       class="btn btn-outline-primary btn-sm"
       style="text-decoration: none; padding: 0.5rem 1.5rem;">
        <i>🛠️</i> Explorar  Mais Ferramentas IAs para Estudos
    </a>
<script>
    const chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
    
    function showLoader() {
        document.getElementById('loader').classList.add('active');
    }
    
    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('active');
    }
    
    function askQuestion(question) {
        document.getElementById('perguntaInput').value = question;
        showLoader();
        document.getElementById('chatForm').submit();
    }
</script>

<?php require_once '../includes/footer.php'; ?>
