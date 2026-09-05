<?php
/**
 * Visualizar Perfil Público - Design Moderno
 */

// IMPORTANTE: Fazer verificações ANTES de incluir header.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ajuste os caminhos conforme sua estrutura
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/User.php';
require_once '../classes/Portfolio.php';

// Verificar autenticação
if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

$user = new User($conn);
$portfolio = new Portfolio($conn);

$user_id = intval($_GET['id'] ?? 0);

// Se tentar ver o próprio perfil por este link, redireciona para a página de edição (meu_perfil.php)
if ($user_id == $_SESSION['user_id']) {
    header('Location: meu_perfil.php');
    exit;
}

// Se ID inválido
if ($user_id <= 0) {
    header('Location: ../dashboard/');
    exit;
}

$user_data = $user->obterPorId($user_id);

if (!$user_data) {
    header('Location: ../dashboard/');
    exit;
}

// Carregar header
$page_title = 'Perfil de ' . $user_data['nome'];
require_once '../includes/header.php';

// Listar portfólio
$result = $portfolio->listarPorUtilizador($user_id);
$portfolio_items = [];
while ($row = $result->fetch_assoc()) {
    $portfolio_items[] = $row;
}
?>

<style>
    :root {
        --primary: #4361ee;
        --secondary: #3f37c9;
        --surface: #ffffff;
        --bg-body: #f8f9fa;
        --text-main: #2b2d42;
        --text-light: #8d99ae;
        --border: #e9ecef;
        --radius: 12px;
        --shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    body {
        background-color: var(--bg-body);
        color: var(--text-main);
        font-family: 'Segoe UI', sans-serif;
    }

    .container-profile {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--text-light);
        text-decoration: none;
        font-weight: 600;
        margin-bottom: 1.5rem;
        transition: color 0.2s;
    }
    .btn-back:hover { color: var(--primary); }

    /* Grid Principal */
    .profile-layout {
        display: grid;
        grid-template-columns: 350px 1fr; /* Coluna esquerda fixa, direita flexível */
        gap: 2rem;
        align-items: start;
    }

    @media (max-width: 900px) {
        .profile-layout {
            grid-template-columns: 1fr; /* Empilha no celular */
        }
    }

    .card {
        background: var(--surface);
        border-radius: var(--radius);
        padding: 2rem;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
    }

    /* Foto de Perfil */
    .profile-avatar {
        width: 150px;
        height: 150px;
        margin: 0 auto 1.5rem;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid var(--surface);
        box-shadow: 0 5px 15px rgba(67, 97, 238, 0.2);
        cursor: zoom-in;
        transition: transform 0.3s;
    }
    .profile-avatar:hover { transform: scale(1.02); }
    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    /* Avatar Genérico (Letra) */
    .avatar-placeholder {
        width: 100%; height: 100%;
        background: var(--primary);
        color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 3.5rem; font-weight: bold;
    }

    .info-list p {
        margin-bottom: 0.8rem;
        font-size: 0.95rem;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.5rem;
    }
    .info-list strong { color: var(--primary); display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Grid do Portfólio */
    .portfolio-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .portfolio-card {
        background: var(--bg-body);
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .portfolio-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        background: white;
    }

    .portfolio-preview {
        height: 160px;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .portfolio-preview img, .portfolio-preview video {
        width: 100%; height: 100%; object-fit: cover;
    }

    .portfolio-content { padding: 1rem; }
    .portfolio-title { font-weight: bold; color: var(--text-main); margin-bottom: 0.3rem; display: block; }
    .portfolio-cat { font-size: 0.8rem; color: var(--text-light); text-transform: uppercase; }

    .btn-action {
        display: block;
        width: 100%;
        text-align: center;
        background: var(--primary);
        color: white;
        padding: 0.5rem;
        text-decoration: none;
        font-size: 0.9rem;
        margin-top: 1rem;
        border-radius: 6px;
    }
    .btn-action:hover { background: var(--secondary); }

    /* Modal */
    .modal-overlay {
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 1000;
        justify-content: center; align-items: center;
    }
    .modal-content img { max-width: 95%; max-height: 90vh; border-radius: 8px; }
    .close-modal { position: absolute; top: 20px; right: 30px; color: white; font-size: 2rem; cursor: pointer; }
</style>

<div class="container-profile">
    <a href="../dashboard/" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Voltar ao Dashboard
    </a>

    <div class="profile-layout">
        
        <div class="card" style="text-align: center;">
            <div class="profile-avatar">
                <?php 
                // Verifica se tem foto
                if (!empty($user_data['foto_perfil']) && file_exists('../' . $user_data['foto_perfil'])): 
                    $foto_url = '../' . htmlspecialchars($user_data['foto_perfil']);
                ?>
                    <img src="<?php echo $foto_url; ?>" alt="Foto" onclick="abrirFoto('<?php echo $foto_url; ?>')">
                <?php else: ?>
                    <div class="avatar-placeholder">
                        <?php echo strtoupper(substr($user_data['nome'], 0, 1)); ?>
                    </div>
                <?php endif; ?>
            </div>

            <h2 style="margin: 0; color: var(--primary); font-size: 1.5rem;"><?php echo htmlspecialchars($user_data['nome']); ?></h2>
            <p style="color: var(--text-light); margin-top: 0.5rem; font-size: 0.9rem;">
                Membro desde <?php echo date('Y', strtotime($user_data['data_registo'])); ?>
            </p>

            <div class="info-list" style="text-align: left; margin-top: 2rem;">
                <p>
                    <strong>Tipo de Usuário</strong>
                    <?php echo ucfirst($user_data['tipo']); ?>
                </p>
                <p>
                    <strong>Curso / Área</strong>
                    <?php echo htmlspecialchars($user_data['curso'] ?? 'Não informado'); ?>
                </p>
                <p style="border: none;">
                    <strong>Nível Académico</strong>
                    <?php echo htmlspecialchars(ucfirst($user_data['nivel_academico'] ?? 'Não informado')); ?>
                </p>
            </div>

            <?php if (!empty($user_data['bio'])): ?>
                <div style="margin-top: 1.5rem; background: var(--bg-body); padding: 1rem; border-radius: 8px; text-align: left;">
                    <strong style="color: var(--primary); font-size: 0.8rem;">SOBRE</strong>
                    <p style="font-size: 0.9rem; color: #555; margin-top: 0.5rem; line-height: 1.5;">
                        <?php echo nl2br(htmlspecialchars($user_data['bio'])); ?>
                    </p>
                </div>
            <?php endif; ?>
        </div>

        <div>
            <div class="card">
                <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                    Portfólio Académico 
                    <span style="font-size: 0.9rem; color: var(--text-light); font-weight: normal;">(<?php echo count($portfolio_items); ?> itens)</span>
                </h3>

                <?php if (empty($portfolio_items)): ?>
                    <div style="text-align: center; padding: 3rem 1rem; color: var(--text-light);">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-bottom: 1rem;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <p>Este utilizador ainda não publicou nenhum trabalho.</p>
                    </div>
                <?php else: ?>
                    
                    <div class="portfolio-grid">
                        <?php foreach ($portfolio_items as $item): ?>
                            <?php 
                                $ext = strtolower(pathinfo($item['ficheiro'], PATHINFO_EXTENSION));
                                $is_img = in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']);
                                $is_vid = in_array($ext, ['mp4', 'webm']);
                                $path = '../' . $item['ficheiro']; // Ajuste se necessário
                            ?>
                            
                            <div class="portfolio-card">
                                <div class="portfolio-preview">
                                    <?php if ($is_img): ?>
                                        <img src="<?php echo htmlspecialchars($path); ?>" alt="Preview">
                                    <?php elseif ($is_vid): ?>
                                        <video muted loop onmouseover="this.play()" onmouseout="this.pause()">
                                            <source src="<?php echo htmlspecialchars($path); ?>">
                                        </video>
                                    <?php else: ?>
                                        <div style="font-size: 3rem; color: var(--text-light);">
                                            <?php if ($ext == 'pdf'): ?>📄
                                            <?php elseif (in_array($ext, ['doc', 'docx'])): ?>📝
                                            <?php elseif (in_array($ext, ['zip', 'rar'])): ?>📦
                                            <?php else: ?>📎<?php endif; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                
                                <div class="portfolio-content">
                                    <span class="portfolio-cat"><?php echo htmlspecialchars($item['categoria'] ?? 'Geral'); ?></span>
                                    <span class="portfolio-title"><?php echo htmlspecialchars($item['titulo']); ?></span>
                                    
                                    <a href="<?php echo htmlspecialchars($path); ?>" target="_blank" class="btn-action">
                                        <?php echo ($is_img || $is_vid) ? 'Visualizar' : 'Baixar Arquivo'; ?>
                                    </a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div id="modal-foto" class="modal-overlay" onclick="fecharFoto(event)">
    <span class="close-modal" onclick="fecharFoto(event)">&times;</span>
    <div class="modal-content">
        <img id="img-grande" src="" alt="Foto Grande">
    </div>
</div>

<script>
    function abrirFoto(url) {
        const modal = document.getElementById('modal-foto');
        document.getElementById('img-grande').src = url;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function fecharFoto(event) {
        if (event.target.className === 'modal-overlay' || event.target.className === 'close-modal') {
            document.getElementById('modal-foto').style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
</script>

<?php require_once '../includes/footer.php'; ?>