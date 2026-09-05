<?php
/**
 * Adicionar Item ao Portfólio - Layout moderno
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/Portfolio.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

$portfolio = new Portfolio($conn);

$mensagem = '';
$erro = '';
$ficheiro_nome = '';
$titulo = '';
$descricao = '';
$categoria = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = trim($_POST['titulo'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');
    $categoria = $_POST['categoria'] ?? '';
    $ficheiro = '';

    if (empty($titulo) || empty($categoria)) {
        $erro = 'Título e categoria são obrigatórios';
    } elseif (empty($_FILES['ficheiro']['tmp_name'])) {
        $erro = 'Seleccione um ficheiro para fazer upload';
    } else {
        $resultado_upload = $portfolio->processarUpload($_FILES['ficheiro']);
        
        if (!$resultado_upload['sucesso']) {
            $erro = $resultado_upload['erro'];
        } else {
            $ficheiro = $resultado_upload['caminho'];
            $ficheiro_nome = $resultado_upload['nome_original'];

            $portfolio->user_id = $_SESSION['user_id'];
            $portfolio->titulo = $titulo;
            $portfolio->descricao = $descricao;
            $portfolio->categoria = $categoria;
            $portfolio->ficheiro = $ficheiro;

            if ($portfolio->criar()) {
                $mensagem = 'Item adicionado ao portfólio com sucesso!';
                $titulo = '';
                $descricao = '';
                $categoria = '';
            } else {
                $erro = 'Erro ao adicionar item à base de dados';
                if (file_exists($ficheiro)) {
                    unlink($ficheiro);
                }
            }
        }
    }
}

$page_title = 'Adicionar ao Portfólio';
require_once '../includes/header.php';

$categorias = [
    'projeto' => ['icon' => '🚀', 'label' => 'Projeto'],
    'trabalho_academico' => ['icon' => '📝', 'label' => 'Trabalho Académico'],
    'artigo' => ['icon' => '📄', 'label' => 'Artigo Científico'],
    'certificado' => ['icon' => '🏆', 'label' => 'Certificado'],
    'portfolio' => ['icon' => '💼', 'label' => 'Portfólio'],
    'outro' => ['icon' => '📎', 'label' => 'Outro']
];
?>

<style>
    .page-header {
        margin-bottom: 1.5rem;
    }
    .page-header a {
        color: var(--secondary-blue);
        text-decoration: none;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }
    .page-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0.75rem 0 0;
    }
    .page-header p {
        color: var(--text-muted);
        margin: 0.25rem 0 0;
    }
    
    .form-card {
        max-width: 600px;
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 2rem;
    }
    
    .form-section-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0 0 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .category-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    .category-option {
        position: relative;
    }
    .category-option input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }
    .category-option label {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem 0.5rem;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
    }
    .category-option label:hover {
        border-color: var(--secondary-blue);
        background: #f0f7ff;
    }
    .category-option input:checked + label {
        border-color: var(--secondary-blue);
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    }
    .category-option .icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
    }
    .category-option .text {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-dark);
    }
    
    .upload-zone {
        position: relative;
        border: 2px dashed var(--secondary-blue);
        border-radius: var(--radius);
        padding: 2.5rem 1.5rem;
        text-align: center;
        background: linear-gradient(135deg, #f0f7ff, #e8f4fc);
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 1.5rem;
    }
    .upload-zone:hover {
        border-color: var(--primary-blue);
        background: linear-gradient(135deg, #e0f0ff, #d8ecfa);
    }
    .upload-zone.dragover {
        border-color: var(--accent-green);
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    }
    .upload-zone input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
    }
    .upload-icon {
        font-size: 3rem;
        margin-bottom: 0.75rem;
    }
    .upload-text {
        font-weight: 600;
        color: var(--primary-blue);
        margin-bottom: 0.25rem;
    }
    .upload-hint {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .file-preview {
        display: none;
        padding: 1rem;
        background: var(--light-gray);
        border-radius: var(--radius-sm);
        margin-bottom: 1.5rem;
    }
    .file-preview.active {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .file-preview .file-icon {
        font-size: 2rem;
    }
    .file-preview .file-info {
        flex: 1;
    }
    .file-preview .file-name {
        font-weight: 600;
        color: var(--text-dark);
        font-size: 0.9rem;
    }
    .file-preview .file-size {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    .file-preview .remove-btn {
        background: #fee2e2;
        color: #dc2626;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .submit-btn {
        width: 100%;
        padding: 1rem;
        background: linear-gradient(135deg, var(--accent-green), #059669);
        color: white;
        border: none;
        border-radius: var(--radius-sm);
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .submit-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .back-link {
        display: block;
        text-align: center;
        margin-top: 1.5rem;
    }
    
    @media (max-width: 600px) {
        .category-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        .form-card {
            padding: 1.5rem;
        }
    }
</style>

<div class="container">
    <div class="page-header">
        <a href="index.php">← Voltar ao Perfil</a>
        <h1>Adicionar ao Portfólio</h1>
        <p>Adicione projetos, trabalhos e certificados para mostrar seu trabalho</p>
    </div>

    <?php if ($mensagem): ?>
        <div class="alert alert-success" style="max-width: 600px;"><?php echo $mensagem; ?></div>
    <?php endif; ?>

    <?php if ($erro): ?>
        <div class="alert alert-error" style="max-width: 600px;"><?php echo $erro; ?></div>
    <?php endif; ?>

    <div class="form-card">
        <form method="POST" enctype="multipart/form-data" id="portfolioForm">
            <div class="form-section-title">📁 Categoria</div>
            <div class="category-grid">
                <?php foreach ($categorias as $key => $cat): ?>
                    <div class="category-option">
                        <input type="radio" name="categoria" id="cat_<?php echo $key; ?>" value="<?php echo $key; ?>" <?php echo $categoria === $key ? 'checked' : ''; ?> required>
                        <label for="cat_<?php echo $key; ?>">
                            <span class="icon"><?php echo $cat['icon']; ?></span>
                            <span class="text"><?php echo $cat['label']; ?></span>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="form-group">
                <label for="titulo">Título do Trabalho</label>
                <input type="text" id="titulo" name="titulo" value="<?php echo htmlspecialchars($titulo); ?>" placeholder="Ex: Projeto Final de Programação" required>
            </div>

            <div class="form-group">
                <label for="descricao">Descrição (opcional)</label>
                <textarea id="descricao" name="descricao" rows="3" placeholder="Descreva brevemente o seu trabalho..."><?php echo htmlspecialchars($descricao); ?></textarea>
            </div>

            <div class="form-section-title">📤 Ficheiro</div>
            <div class="upload-zone" id="uploadZone">
                <input type="file" id="ficheiro" name="ficheiro" required 
                       accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.txt,.zip,.rar">
                <div class="upload-icon">📁</div>
                <div class="upload-text">Clique ou arraste um ficheiro</div>
                <div class="upload-hint">PDF, DOC, Imagens, Vídeos (máximo 100 MB)</div>
            </div>
            
            <div class="file-preview" id="filePreview">
                <span class="file-icon" id="fileIcon">📎</span>
                <div class="file-info">
                    <div class="file-name" id="fileName"></div>
                    <div class="file-size" id="fileSize"></div>
                </div>
                <button type="button" class="remove-btn" onclick="clearFile()">✕</button>
            </div>

            <button type="submit" class="submit-btn">✓ Adicionar ao Portfólio</button>
        </form>
    </div>
    
    <a href="index.php" class="back-link btn btn-secondary">← Voltar ao Perfil</a>
</div>

<script>
const fileInput = document.getElementById('ficheiro');
const uploadZone = document.getElementById('uploadZone');
const filePreview = document.getElementById('filePreview');
const fileIcon = document.getElementById('fileIcon');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');

const iconMap = {
    'pdf': '📄', 'doc': '📝', 'docx': '📝', 'xls': '📊', 'xlsx': '📊',
    'ppt': '🎯', 'pptx': '🎯', 'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️',
    'gif': '🖼️', 'mp4': '🎥', 'avi': '🎥', 'mov': '🎥', 'txt': '📄', 
    'zip': '📦', 'rar': '📦'
};

function getIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return iconMap[ext] || '📎';
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function showFilePreview(file) {
    fileIcon.textContent = getIcon(file.name);
    fileName.textContent = file.name;
    fileSize.textContent = formatSize(file.size);
    filePreview.classList.add('active');
    uploadZone.style.display = 'none';
}

function clearFile() {
    fileInput.value = '';
    filePreview.classList.remove('active');
    uploadZone.style.display = 'block';
}

fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        showFilePreview(this.files[0]);
    }
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        showFilePreview(e.dataTransfer.files[0]);
    }
});
</script>

<?php require_once '../includes/footer.php'; ?>
