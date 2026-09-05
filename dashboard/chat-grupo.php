<?php
/**
 * Chat de Grupo - Layout moderno e responsivo
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/Group.php';
require_once '../classes/User.php'; // ADICIONADO

if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

$group_id = intval($_GET['id'] ?? 0);
if ($group_id <= 0) {
    header('Location: my-groups.php');
    exit;
}

$group = new Group($conn);

if (!$group->pertenceAoGrupo($group_id, $_SESSION['user_id']) && $_SESSION['user_tipo'] !== 'especialista') {
    header('Location: my-groups.php');
    exit;
}

$page_title = 'Chat do Grupo';
require_once '../includes/header.php';
require_once '../classes/ChatMessage.php';
require_once '../classes/FileManager.php';

$chatMessage = new ChatMessage($conn);
$fileManager = new FileManager($conn);
$userObj = new User($conn); // ADICIONADO

$grupo = $group->obterPorId($group_id);

if (!$grupo) {
    header('Location: my-groups.php');
    exit;
}

$mensagem_enviada = '';
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'enviar_mensagem') {
    $conteudo = trim($_POST['conteudo'] ?? '');
    $tipo_mensagem = 'texto';
    $ficheiro_path = null;
    $ficheiro_nome = null;
    $ficheiro_tamanho = null;

    if (!empty($_FILES['ficheiro']['tmp_name'])) {
        $file = $_FILES['ficheiro'];
        $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $tipo_ficheiro = $fileManager->obterTipoFicheiro($extensao);

        $upload_result = $fileManager->uploadFile($file, $tipo_ficheiro);

        if ($upload_result['sucesso']) {
            $tipo_mensagem = $tipo_ficheiro;
            $ficheiro_path = $upload_result['caminho'];
            $ficheiro_nome = $upload_result['nome_original'];
            $ficheiro_tamanho = $upload_result['tamanho'];
        } else {
            $erro = $upload_result['erro'];
        }
    }

    if (empty($conteudo) && empty($ficheiro_path)) {
        $erro = 'Envie uma mensagem ou um ficheiro';
    } elseif (!$erro) {
        $chatMessage->user_id = $_SESSION['user_id'];
        $chatMessage->group_id = $group_id;
        $chatMessage->conteudo = $conteudo;
        $chatMessage->tipo_mensagem = $tipo_mensagem;
        $chatMessage->ficheiro_path = $ficheiro_path;
        $chatMessage->ficheiro_nome = $ficheiro_nome;
        $chatMessage->ficheiro_tamanho = $ficheiro_tamanho;

        if ($chatMessage->criar()) {
            $mensagem_enviada = 'Mensagem enviada!';
        } else {
            $erro = 'Erro ao enviar mensagem';
        }
    }
}

$result = $chatMessage->listarPorGrupo($group_id, 100, 0);
$mensagens = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $mensagens[] = $row;
    }
    $mensagens = array_reverse($mensagens);
}

$result = $group->listarMembros($group_id);
$membros = [];
while ($row = $result->fetch_assoc()) {
    $membros[] = $row;
}

// Buscar fotos dos membros
$fotos_membros = [];
foreach ($membros as $m) {
    $usuario_detalhes = $userObj->obterPorId($m['id']);
    $fotos_membros[$m['id']] = $usuario_detalhes['foto_perfil'] ?? null;
}
?>

<!-- O CSS permanece o mesmo, apenas adicione este estilo extra -->
<style>
  .chat-container {
        display: grid;
        grid-template-columns: 1fr 260px;
        gap: 1rem;
        height: calc(100vh - 200px);
        min-height: 500px;
    }
    
    .chat-main {
        display: flex;
        flex-direction: column;
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        overflow: hidden;
    }
    
    .chat-header {
        background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
        color: white;
        padding: 1rem 1.25rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .chat-header-info h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
    }
    .chat-header-info p {
        margin: 0.25rem 0 0;
        font-size: 0.8rem;
        opacity: 0.85;
    }
    .chat-header a {
        color: white;
        text-decoration: none;
        font-size: 0.85rem;
        opacity: 0.9;
    }
    .chat-header a:hover {
        opacity: 1;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .msg {
        max-width: 75%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        position: relative;
    }
    .msg-mine {
        align-self: flex-end;
        background: linear-gradient(135deg, var(--secondary-blue), #0066cc);
        color: white;
        border-bottom-right-radius: 4px;
    }
    .msg-other {
        align-self: flex-start;
        background: white;
        color: var(--text-dark);
        border: 1px solid var(--border-color);
        border-bottom-left-radius: 4px;
    }
    .msg-author {
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    .msg-mine .msg-author { color: rgba(255,255,255,0.85); }
    .msg-other .msg-author { color: var(--secondary-blue); }
    .msg-text {
        font-size: 0.9rem;
        line-height: 1.4;
        word-break: break-word;
    }
    .msg-time {
        font-size: 0.65rem;
        opacity: 0.7;
        margin-top: 0.25rem;
        text-align: right;
    }
    .msg-media {
        margin-top: 0.5rem;
        max-width: 100%;
    }
    .msg-media img {
        max-width: 100%;
        max-height: 250px;
        border-radius: 0.5rem;
    }
    .msg-media video, .msg-media audio {
        max-width: 100%;
        border-radius: 0.5rem;
    }
    .msg-file-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(0,0,0,0.1);
        border-radius: 0.5rem;
        text-decoration: none;
        font-size: 0.85rem;
        margin-top: 0.5rem;
    }
    .msg-mine .msg-file-link { color: white; }
    .msg-other .msg-file-link { color: var(--secondary-blue); background: var(--light-gray); }
    
    .chat-input-area {
        padding: 0.75rem 1rem;
        background: white;
        border-top: 1px solid var(--border-color);
    }
    .chat-input-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    .chat-input-row input[type="text"] {
        flex: 1;
        padding: 0.7rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 25px;
        font-size: 0.9rem;
    }
    .chat-input-row input[type="text"]:focus {
        border-color: var(--secondary-blue);
        outline: none;
    }
    .media-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }
    .media-btn:hover {
        transform: scale(1.1);
    }
    .media-btn.attach { background: var(--secondary-blue); color: white; }
    .media-btn.camera { background: #10b981; color: white; }
    .media-btn.audio { background: #ef4444; color: white; }
    .send-btn {
        padding: 0.7rem 1.25rem;
        background: var(--secondary-blue);
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
    }
    .file-preview {
        display: none;
        padding: 0.5rem 0.75rem;
        background: var(--light-gray);
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
        font-size: 0.85rem;
        align-items: center;
        justify-content: space-between;
    }
    .file-preview.active { display: flex; }
    .file-preview .remove { cursor: pointer; color: #ef4444; font-weight: bold; }
    
    .sidebar {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 1rem;
        overflow-y: auto;
    }
    .sidebar-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);
    }
    .member-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
    }
    .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--secondary-blue);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.6rem;
    }
    .member-name { font-size: 0.85rem; font-weight: 500; }
    .member-type { font-size: 0.7rem; color: var(--text-muted); }
    
    .toggle-sidebar {
        display: none;
        position: fixed;
        bottom: 100px;
        right: 1rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-blue);
        color: white;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        z-index: 100;
    }
    
    .empty-chat {
        text-align: center;
        color: var(--text-muted);
        padding: 3rem;
    }
    .empty-chat .icon { font-size: 3rem; margin-bottom: 1rem; }
    
    /* Modal de Captura */
    .capture-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }
    .capture-modal.active { display: flex; }
    .capture-box {
        background: white;
        border-radius: var(--radius);
        padding: 1.5rem;
        max-width: 450px;
        width: 100%;
    }
    .capture-box h3 {
        margin: 0 0 1rem;
        color: var(--primary-blue);
    }
    .capture-box video, .capture-box canvas {
        width: 100%;
        border-radius: var(--radius-sm);
        background: #000;
    }
    .capture-btns {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }
    .capture-btns button {
        flex: 1;
        min-width: 80px;
        padding: 0.6rem;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-weight: 600;
        color: white;
    }
    .audio-timer {
        font-size: 2rem;
        font-weight: bold;
        color: #ef4444;
        text-align: center;
        margin: 1rem 0;
    }
    
    @media (max-width: 768px) {
        .chat-container {
            grid-template-columns: 1fr;
            height: calc(100vh - 160px);
        }
        .sidebar {
            display: none;
            position: fixed;
            top: 0;
            right: 0;
            width: 280px;
            height: 100vh;
            z-index: 200;
            border-radius: 0;
        }
        .sidebar.active { display: block; }
        .toggle-sidebar { display: flex; align-items: center; justify-content: center; }
        .msg { max-width: 85%; }
        .chat-input-row { flex-wrap: wrap; }
        .chat-input-row input[type="text"] { flex: 1 1 100%; order: 1; margin-bottom: 0.5rem; }
        .send-btn { order: 5; flex: 1; }
    }


    .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--secondary-blue);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.6rem;
        overflow: hidden; /* ADICIONADO */
        position: relative; /* ADICIONADO */
    }
    
    .msg-author-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--secondary-blue);
        flex-shrink: 0;
    }
    
    .msg-author-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .msg-author-avatar-inicial {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.6rem;
        font-weight: 600;
    }
</style>

<div class="container">
    <?php if ($erro): ?>
        <div class="alert alert-error" style="margin-bottom: 1rem;"><?php echo $erro; ?></div>
    <?php endif; ?>

    <div class="chat-container">
        <div class="chat-main">
            <div class="chat-header">
                <div class="chat-header-info">
                    <h2>💬 <?php echo htmlspecialchars($grupo['nome']); ?></h2>
                    <p><?php echo count($membros); ?> membros</p>
                </div>
                <a href="group-view.php?id=<?php echo $group_id; ?>">← Voltar ao Grupo</a>
            </div>
            
            <div class="chat-messages" id="chatBox">
                <?php if (empty($mensagens)): ?>
                    <div class="empty-chat">
                        <div class="icon">💬</div>
                        <p>Nenhuma mensagem ainda.<br>Seja o primeiro a enviar!</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($mensagens as $msg): 
                        $isMine = $msg['user_id'] == $_SESSION['user_id'];
                        $foto_autor = $fotos_membros[$msg['user_id']] ?? null;
                    ?>
                        <div class="msg <?php echo $isMine ? 'msg-mine' : 'msg-other'; ?>">
                            <?php if (!$isMine): ?>
                                <div class="msg-author">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <div class="msg-author-avatar">
                                            <?php if (!empty($foto_autor) && file_exists('../' . $foto_autor)): ?>
                                                <img src="../<?php echo htmlspecialchars($foto_autor); ?>" 
                                                     alt="<?php echo htmlspecialchars($msg['nome']); ?>">
                                            <?php else: ?>
                                                <div class="msg-author-avatar-inicial">
                                                    <?php echo strtoupper(substr($msg['nome'], 0, 1)); ?>
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                        <?php echo htmlspecialchars($msg['nome']); ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                            
                            <?php if (!empty($msg['conteudo'])): ?>
                                <div class="msg-text"><?php echo htmlspecialchars($msg['conteudo']); ?></div>
                            <?php endif; ?>
                            
                            <?php if (!empty($msg['ficheiro_path']) && file_exists($msg['ficheiro_path'])): ?>
                                <div class="msg-media">
                                    <?php if ($msg['tipo_mensagem'] === 'imagem'): ?>
                                        <img src="<?php echo htmlspecialchars($msg['ficheiro_path']); ?>" alt="Imagem">
                                    <?php elseif ($msg['tipo_mensagem'] === 'video'): ?>
                                        <video controls><source src="<?php echo htmlspecialchars($msg['ficheiro_path']); ?>"></video>
                                    <?php elseif ($msg['tipo_mensagem'] === 'audio'): ?>
                                        <audio controls><source src="<?php echo htmlspecialchars($msg['ficheiro_path']); ?>"></audio>
                                    <?php else: ?>
                                        <a href="<?php echo htmlspecialchars($msg['ficheiro_path']); ?>" download class="msg-file-link">
                                            📎 <?php echo htmlspecialchars($msg['ficheiro_nome']); ?>
                                        </a>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                            
                            <div class="msg-time"><?php echo date('H:i', strtotime($msg['data_criacao'])); ?></div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
            
            <div class="chat-input-area">
                <div class="file-preview" id="filePreview">
                    <span>📎 <span id="fileName"></span></span>
                    <span class="remove" onclick="clearFile()">✕</span>
                </div>
                <form method="POST" enctype="multipart/form-data" class="chat-input-row" id="chatForm">
                    <input type="hidden" name="action" value="enviar_mensagem">
                    <input type="text" name="conteudo" placeholder="Escreva uma mensagem..." autocomplete="off">
                    <label class="media-btn attach" title="Anexar ficheiro">
                        📎
                        <input type="file" name="ficheiro" id="fileInput" style="display:none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
                    </label>
                    <button type="button" class="media-btn camera" onclick="openCapture('camera')" title="Tirar foto">📷</button>
                    <button type="button" class="media-btn audio" onclick="openCapture('audio')" title="Gravar áudio">🎙️</button>
                    <button type="submit" class="send-btn">Enviar</button>
                </form>
            </div>
        </div>
        
        <div class="sidebar" id="sidebar">
            <div class="sidebar-title">👥 Membros (<?php echo count($membros); ?>)</div>
            <?php foreach ($membros as $m): 
                $foto_membro = $fotos_membros[$m['id']] ?? null;
            ?>
                <div class="member-item">
                    <div class="member-avatar">
                        <?php if (!empty($foto_membro) && file_exists('../' . $foto_membro)): ?>
                            <img src="../<?php echo htmlspecialchars($foto_membro); ?>" 
                                 alt="<?php echo htmlspecialchars($m['nome']); ?>"
                                 style="width: 100%; height: 100%; object-fit: cover;">
                        <?php else: ?>
                            <div style="width: 100%; height: 100%; border-radius: 50%; background: var(--secondary-blue); 
                                        display: flex; align-items: center; justify-content: center; 
                                        color: white; font-size: 0.75rem; font-weight: 600;">
                                <?php echo strtoupper(substr($m['nome'], 0, 1)); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div>
                        <div class="member-name"><?php echo htmlspecialchars($m['nome']); ?></div>
                        <div class="member-type"><?php echo ucfirst($m['tipo']); ?></div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <button class="toggle-sidebar" onclick="toggleSidebar()">👥</button>
</div>

<!-- Modal de Captura -->
<div class="capture-modal" id="captureModal">
    <div class="capture-box">
        <div id="cameraSection" style="display:none;">
            <h3>📷 Capturar Foto</h3>
            <video id="cameraVideo" autoplay playsinline></video>
            <canvas id="cameraCanvas" style="display:none;"></canvas>
            <img id="cameraPreview" style="display:none; width:100%; border-radius:8px;">
            <div class="capture-btns">
                <button id="btnCamStart" onclick="startCamera()" style="background:#10b981;">Iniciar</button>
                <button id="btnCamCapture" onclick="capturePhoto()" style="background:#f59e0b; display:none;">Capturar</button>
                <button id="btnCamRetake" onclick="retakePhoto()" style="background:#3b82f6; display:none;">Retomar</button>
                <button id="btnCamSend" onclick="sendCapture('camera')" style="background:#10b981; display:none;">Usar Foto</button>
                <button onclick="closeCapture()" style="background:#6b7280;">Fechar</button>
            </div>
        </div>
        <div id="audioSection" style="display:none;">
            <h3>🎙️ Gravar Áudio</h3>
            <div class="audio-timer" id="audioTimer">00:00</div>
            <audio id="audioPlayback" controls style="width:100%; display:none;"></audio>
            <div class="capture-btns">
                <button id="btnAudStart" onclick="startRecording()" style="background:#ef4444;">Gravar</button>
                <button id="btnAudStop" onclick="stopRecording()" style="background:#f59e0b; display:none;">Parar</button>
                <button id="btnAudPlay" onclick="playRecording()" style="background:#3b82f6; display:none;">Ouvir</button>
                <button id="btnAudRetake" onclick="retakeAudio()" style="background:#8b5cf6; display:none;">Retomar</button>
                <button id="btnAudSend" onclick="sendCapture('audio')" style="background:#10b981; display:none;">Usar Áudio</button>
                <button onclick="closeCapture()" style="background:#6b7280;">Fechar</button>
            </div>
        </div>
    </div>
</div>

<script>
// O JavaScript permanece o mesmo
document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;

let mediaStream = null, mediaRecorder = null, audioChunks = [], capturedBlob = null, timerInterval = null;

document.getElementById('fileInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('fileName').textContent = this.files[0].name;
        document.getElementById('filePreview').classList.add('active');
    }
});

function clearFile() {
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').classList.remove('active');
    capturedBlob = null;
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function openCapture(type) {
    document.getElementById('captureModal').classList.add('active');
    document.getElementById('cameraSection').style.display = type === 'camera' ? 'block' : 'none';
    document.getElementById('audioSection').style.display = type === 'audio' ? 'block' : 'none';
}

function closeCapture() {
    document.getElementById('captureModal').classList.remove('active');
    stopCamera();
    stopRecording();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            mediaStream = stream;
            document.getElementById('cameraVideo').srcObject = stream;
            document.getElementById('btnCamStart').style.display = 'none';
            document.getElementById('btnCamCapture').style.display = 'inline-block';
        })
        .catch(err => alert('Erro ao acessar câmera: ' + err.message));
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
        capturedBlob = blob;
        document.getElementById('cameraPreview').src = URL.createObjectURL(blob);
        document.getElementById('cameraPreview').style.display = 'block';
        document.getElementById('cameraVideo').style.display = 'none';
        document.getElementById('btnCamCapture').style.display = 'none';
        document.getElementById('btnCamRetake').style.display = 'inline-block';
        document.getElementById('btnCamSend').style.display = 'inline-block';
    }, 'image/jpeg');
}

function retakePhoto() {
    document.getElementById('cameraPreview').style.display = 'none';
    document.getElementById('cameraVideo').style.display = 'block';
    document.getElementById('btnCamRetake').style.display = 'none';
    document.getElementById('btnCamSend').style.display = 'none';
    document.getElementById('btnCamCapture').style.display = 'inline-block';
    capturedBlob = null;
}

function stopCamera() {
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaStream = stream;
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            let startTime = Date.now();
            
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                capturedBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                document.getElementById('audioPlayback').src = URL.createObjectURL(capturedBlob);
                document.getElementById('audioPlayback').style.display = 'block';
                document.getElementById('btnAudStop').style.display = 'none';
                document.getElementById('btnAudPlay').style.display = 'inline-block';
                document.getElementById('btnAudRetake').style.display = 'inline-block';
                document.getElementById('btnAudSend').style.display = 'inline-block';
            };
            
            mediaRecorder.start();
            document.getElementById('btnAudStart').style.display = 'none';
            document.getElementById('btnAudStop').style.display = 'inline-block';
            
            timerInterval = setInterval(() => {
                let elapsed = Math.floor((Date.now() - startTime) / 1000);
                document.getElementById('audioTimer').textContent = 
                    String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(elapsed % 60).padStart(2, '0');
            }, 100);
        })
        .catch(err => alert('Erro ao acessar microfone: ' + err.message));
}

function stopRecording() {
    clearInterval(timerInterval);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
}

function playRecording() {
    document.getElementById('audioPlayback').play();
}

function retakeAudio() {
    document.getElementById('audioPlayback').style.display = 'none';
    document.getElementById('btnAudPlay').style.display = 'none';
    document.getElementById('btnAudRetake').style.display = 'none';
    document.getElementById('btnAudSend').style.display = 'none';
    document.getElementById('btnAudStart').style.display = 'inline-block';
    document.getElementById('audioTimer').textContent = '00:00';
    capturedBlob = null;
}

function sendCapture(type) {
    if (!capturedBlob) return;
    const dt = new DataTransfer();
    const name = type === 'camera' ? 'foto_' + Date.now() + '.jpg' : 'audio_' + Date.now() + '.mp3';
    const mime = type === 'camera' ? 'image/jpeg' : 'audio/mp3';
    dt.items.add(new File([capturedBlob], name, { type: mime }));
    document.getElementById('fileInput').files = dt.files;
    document.getElementById('fileName').textContent = name;
    document.getElementById('filePreview').classList.add('active');
    closeCapture();
}
</script>

<?php require_once '../includes/footer.php'; ?>