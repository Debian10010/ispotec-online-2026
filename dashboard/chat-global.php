<?php
/**
 * Chat Global - Layout moderno e responsivo
 */

$page_title = 'Chat Global';
require_once '../auth/check-auth.php';
require_once '../includes/header.php';
require_once '../classes/ChatMessage.php';
require_once '../classes/FileManager.php';

$mensagem_enviada = '';
$erro = '';

$chatMessage = new ChatMessage($conn);
$fileManager = new FileManager($conn);

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
        $chatMessage->group_id = null;
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

$result = $chatMessage->listarChatGlobal(100, 0);
$mensagens = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $mensagens[] = $row;
    }
    $mensagens = array_reverse($mensagens);
}
?>

<style>
    .chat-page {
        max-width: 900px;
        margin: 0 auto;
    }
    
    .chat-header-bar {
        background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border-radius: var(--radius) var(--radius) 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .chat-header-bar h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .chat-header-bar p {
        margin: 0.25rem 0 0;
        font-size: 0.85rem;
        opacity: 0.85;
    }
    .chat-header-bar a {
        color: white;
        text-decoration: none;
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .chat-box {
        background: var(--white);
        border-radius: 0 0 var(--radius) var(--radius);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        height: calc(100vh - 280px);
        min-height: 450px;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .msg {
        max-width: 75%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        position: relative;
        animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .msg-mine {
        align-self: flex-end;
        background: linear-gradient(135deg, #ec4899, #db2777);
        color: white;
        border-bottom-right-radius: 4px;
    }
    .msg-other {
        align-self: flex-start;
        background: white;
        color: var(--text-dark);
        border: 1px solid var(--border-color);
        border-bottom-left-radius: 4px;
        box-shadow: var(--shadow-sm);
    }
    .msg-author {
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .msg-mine .msg-author { color: rgba(255,255,255,0.85); }
    .msg-other .msg-author { color: var(--secondary-blue); }
    .msg-badge {
        font-size: 0.65rem;
        padding: 0.1rem 0.4rem;
        border-radius: 10px;
        font-weight: 500;
    }
    .msg-other .msg-badge {
        background: var(--light-gray);
        color: var(--text-muted);
    }
    .msg-mine .msg-badge {
        background: rgba(255,255,255,0.2);
    }
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
        border-color: #ec4899;
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
    .media-btn:hover { transform: scale(1.1); }
    .media-btn.attach { background: #ec4899; color: white; }
    .media-btn.camera { background: #10b981; color: white; }
    .media-btn.audio { background: #ef4444; color: white; }
    .send-btn {
        padding: 0.7rem 1.25rem;
        background: linear-gradient(135deg, #ec4899, #db2777);
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
    
    .back-link {
        display: block;
        text-align: center;
        margin-top: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .chat-box {
            height: calc(100vh - 220px);
        }
        .msg { max-width: 85%; }
        .chat-input-row { flex-wrap: wrap; }
        .chat-input-row input[type="text"] { 
            flex: 1 1 100%; 
            order: 1; 
            margin-bottom: 0.5rem; 
        }
        .send-btn { order: 5; flex: 1; }
        .chat-header-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
</style>

<div class="container">
    <?php if ($erro): ?>
        <div class="alert alert-error" style="margin-bottom: 1rem;"><?php echo $erro; ?></div>
    <?php endif; ?>

    <div class="chat-page">
        <div class="chat-header-bar">
            <div>
                <h1>💬 Chat Global</h1>
                <p>Converse com toda a comunidade ISPOTEC</p>
            </div>
            <a href="index.php">← Dashboard</a>
        </div>
        
        <div class="chat-box">
            <div class="chat-messages" id="chatBox">
                <?php if (empty($mensagens)): ?>
                    <div class="empty-chat">
                        <div class="icon">🌍</div>
                        <p>Seja o primeiro a iniciar uma conversa global!</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($mensagens as $msg): ?>
                        <?php $isMine = $msg['user_id'] == $_SESSION['user_id']; ?>
                        <div class="msg <?php echo $isMine ? 'msg-mine' : 'msg-other'; ?>">
                            <div class="msg-author">
                                <?php echo htmlspecialchars($msg['nome']); ?>
                                <span class="msg-badge"><?php echo ucfirst($msg['user_tipo']); ?></span>
                            </div>
                            <?php if (!empty($msg['conteudo'])): ?>
                                <div class="msg-text"><?php echo nl2br(htmlspecialchars($msg['conteudo'])); ?></div>
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
                    <span style="cursor:pointer; color:#ef4444; font-weight:bold;" onclick="clearFile()">✕</span>
                </div>
                <form method="POST" enctype="multipart/form-data" class="chat-input-row" id="chatForm">
                    <input type="hidden" name="action" value="enviar_mensagem">
                    <input type="text" name="conteudo" placeholder="Escreva uma mensagem..." autocomplete="off">
                    <label class="media-btn attach" title="Anexar">
                        📎
                        <input type="file" name="ficheiro" id="fileInput" style="display:none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
                    </label>
                    <button type="button" class="media-btn camera" onclick="openCapture('camera')" title="Foto">📷</button>
                    <button type="button" class="media-btn audio" onclick="openCapture('audio')" title="Áudio">🎙️</button>
                    <button type="submit" class="send-btn">Enviar</button>
                </form>
            </div>
        </div>
        
        <a href="index.php" class="back-link btn btn-secondary">← Voltar ao Dashboard</a>
    </div>
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
                <button id="btnCamSend" onclick="sendCapture('camera')" style="background:#10b981; display:none;">Usar</button>
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
                <button id="btnAudSend" onclick="sendCapture('audio')" style="background:#10b981; display:none;">Usar</button>
                <button onclick="closeCapture()" style="background:#6b7280;">Fechar</button>
            </div>
        </div>
    </div>
</div>

<script>
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
        .catch(err => alert('Erro: ' + err.message));
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
        .catch(err => alert('Erro: ' + err.message));
}

function stopRecording() {
    clearInterval(timerInterval);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
}

function playRecording() { document.getElementById('audioPlayback').play(); }

function retakeAudio() {
    document.getElementById('audioPlayback').style.display = 'none';
    ['btnAudPlay', 'btnAudRetake', 'btnAudSend'].forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('btnAudStart').style.display = 'inline-block';
    document.getElementById('audioTimer').textContent = '00:00';
    capturedBlob = null;
}

function sendCapture(type) {
    if (!capturedBlob) return;
    const dt = new DataTransfer();
    const name = type === 'camera' ? 'foto_' + Date.now() + '.jpg' : 'audio_' + Date.now() + '.mp3';
    dt.items.add(new File([capturedBlob], name, { type: type === 'camera' ? 'image/jpeg' : 'audio/mp3' }));
    document.getElementById('fileInput').files = dt.files;
    document.getElementById('fileName').textContent = name;
    document.getElementById('filePreview').classList.add('active');
    closeCapture();
}
</script>

<?php require_once '../includes/footer.php'; ?>
