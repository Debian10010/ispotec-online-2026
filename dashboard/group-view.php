<?php
/**
 * Visualizar Grupo - Ver Posts e Membros
 * Layout moderno e responsivo
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/Group.php';
require_once '../classes/Post.php';
require_once '../classes/Comment.php';

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

$page_title = 'Visualizar Grupo';
require_once '../includes/header.php';
$post = new Post($conn);
$comment = new Comment($conn);

$grupo = $group->obterPorId($group_id);

if (!$grupo) {
    header('Location: my-groups.php');
    exit;
}

$mensagem = '';
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'criar_post') {
    $titulo = trim($_POST['titulo'] ?? '');
    $conteudo = trim($_POST['conteudo'] ?? '');
    $tipo = $_POST['tipo'] ?? 'discussao';

    if (empty($titulo) || empty($conteudo)) {
        $erro = 'Título e conteúdo são obrigatórios';
    } else {
        $post->user_id = $_SESSION['user_id'];
        $post->group_id = $group_id;
        $post->titulo = $titulo;
        $post->conteudo = $conteudo;
        $post->tipo = $tipo;

        if ($post->criar()) {
            $mensagem = 'Publicação criada com sucesso!';
        } else {
            $erro = 'Erro ao criar publicação';
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'criar_comentario') {
    $post_id = intval($_POST['post_id'] ?? 0);
    $conteudo = trim($_POST['conteudo'] ?? '');

    if (empty($conteudo)) {
        $erro = 'Comentário não pode estar vazio';
    } else {
        $comment->post_id = $post_id;
        $comment->user_id = $_SESSION['user_id'];
        $comment->conteudo = $conteudo;

        if ($comment->criar()) {
            $mensagem = 'Comentário adicionado!';
        } else {
            $erro = 'Erro ao adicionar comentário';
        }
    }
}

$result = $group->listarMembros($group_id);
$membros = [];
while ($row = $result->fetch_assoc()) {
    $membros[] = $row;
}

$result = $post->listarPorGrupo($group_id);
$posts = [];
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

$tipo_cores = [
    'discussao' => '#3b82f6',
    'material' => '#10b981',
    'artigo' => '#8b5cf6',
    'projeto' => '#f59e0b'
];
?>

<style>
    .group-header {
        background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
        color: white;
        padding: 1.5rem;
        border-radius: var(--radius);
        margin-bottom: 1.5rem;
    }
    .group-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .group-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        opacity: 0.9;
        margin-bottom: 0.5rem;
    }
    .group-breadcrumb a {
        color: white;
        text-decoration: none;
    }
    .group-breadcrumb a:hover {
        text-decoration: underline;
    }
    .group-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }
    .group-desc {
        opacity: 0.85;
        font-size: 0.95rem;
        margin-top: 0.25rem;
    }
    .group-actions {
        display: flex;
        gap: 0.75rem;
    }
    .btn-chat {
        background: rgba(255,255,255,0.2);
        color: white;
        padding: 0.6rem 1.25rem;
        border-radius: var(--radius-sm);
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
    }
    .btn-chat:hover {
        background: rgba(255,255,255,0.3);
    }

    .content-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1.5rem;
    }

    .post-form-card {
        background: var(--white);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow);
        margin-bottom: 1.5rem;
    }
    .post-form-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .posts-section-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .posts-count {
        background: var(--secondary-blue);
        color: white;
        padding: 0.15rem 0.6rem;
        border-radius: 12px;
        font-size: 0.8rem;
    }

    .post-card {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        margin-bottom: 1rem;
        overflow: hidden;
    }
    .post-header {
        padding: 1.25rem 1.25rem 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .post-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--secondary-blue);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1rem;
        margin-right: 0.75rem;
    }
    .post-meta {
        flex: 1;
    }
    .post-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0 0 0.25rem;
    }
    .post-author {
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    .post-type-badge {
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
    }
    .post-content {
        padding: 1rem 1.25rem;
        color: var(--text-dark);
        line-height: 1.6;
    }
    .post-footer {
        padding: 0.75rem 1.25rem;
        background: var(--light-gray);
        border-top: 1px solid var(--border-color);
    }

    .comments-section {
        padding: 1rem 1.25rem;
        background: #fafafa;
    }
    .comment-item {
        background: white;
        padding: 0.75rem;
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
        border-left: 3px solid var(--border-color);
    }
    .comment-author {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-dark);
    }
    .comment-text {
        font-size: 0.9rem;
        color: var(--text-dark);
        margin-top: 0.25rem;
    }
    .comment-form {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    .comment-form input {
        flex: 1;
        padding: 0.6rem 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
    }

    .sidebar-card {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 1.25rem;
        position: sticky;
        top: 100px;
    }
    .sidebar-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);
    }
    .member-item {
        display: flex;
        align-items: center;
        padding: 0.6rem 0;
        border-bottom: 1px solid var(--light-gray);
    }
    .member-item:last-child {
        border-bottom: none;
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
        margin-right: 0.75rem;
    }
    .member-name {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-dark);
    }
    .member-type {
        font-size: 0.75rem;
        color: var(--text-muted);
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1.5rem;
        color: var(--text-muted);
    }
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    @media (max-width: 900px) {
        .content-grid {
            grid-template-columns: 1fr;
        }
        .sidebar-card {
            position: static;
        }
        .group-header-content {
            flex-direction: column;
            align-items: flex-start;
        }
    }
    @media (max-width: 480px) {
        .group-header {
            padding: 1rem;
        }
        .group-title {
            font-size: 1.25rem;
        }
        .post-header {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
</style>

<div class="container">
    <!-- Group Header -->
    <div class="group-header">
        <div class="group-header-content">
            <div>
                <div class="group-breadcrumb">
                    <a href="my-groups.php">← Meus Grupos</a>
                    <span>/</span>
                    <span><?php echo htmlspecialchars($grupo['nome']); ?></span>
                </div>
                <h1 class="group-title"><?php echo htmlspecialchars($grupo['nome']); ?></h1>
                <?php if (!empty($grupo['descricao'])): ?>
                    <p class="group-desc"><?php echo htmlspecialchars($grupo['descricao']); ?></p>
                <?php endif; ?>
            </div>
            <div class="group-actions">
                <a href="chat-grupo.php?id=<?php echo $group_id; ?>" class="btn-chat">💬 Chat do Grupo</a>
            </div>
        </div>
    </div>

    <?php if ($mensagem): ?>
        <div class="alert alert-success"><?php echo $mensagem; ?></div>
    <?php endif; ?>
    <?php if ($erro): ?>
        <div class="alert alert-error"><?php echo $erro; ?></div>
    <?php endif; ?>

    <div class="content-grid">
        <!-- Main Content -->
        <div>
            <!-- Post Form -->
            <div class="post-form-card">
                <div class="post-form-title">✏️ Criar Nova Publicação</div>
                <form method="POST">
                    <input type="hidden" name="action" value="criar_post">
                    <div class="form-group">
                        <input type="text" name="titulo" placeholder="Título da publicação..." required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; margin-bottom: 1rem;">
                        <select name="tipo" style="padding: 0.6rem;">
                            <option value="discussao">💬 Discussão</option>
                            <option value="material">📚 Material</option>
                            <option value="artigo">📄 Artigo</option>
                            <option value="projeto">🚀 Projeto</option>
                        </select>
                        <button type="submit" class="btn btn-success">Publicar</button>
                    </div>
                    <textarea name="conteudo" rows="3" placeholder="Escreva o conteúdo..." required></textarea>
                </form>
            </div>

            <!-- Posts -->
            <div class="posts-section-title">
                📝 Publicações <span class="posts-count"><?php echo count($posts); ?></span>
            </div>

            <?php if (empty($posts)): ?>
                <div class="post-card">
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p>Ainda não há publicações neste grupo.<br>Seja o primeiro a publicar!</p>
                    </div>
                </div>
            <?php else: ?>
                <?php foreach ($posts as $p): ?>
                    <?php $cor = $tipo_cores[$p['tipo']] ?? '#6b7280'; ?>
                    <div class="post-card">
                        <div class="post-header">
                            <div style="display: flex; align-items: flex-start;">
                                <div class="post-avatar"><?php echo strtoupper(substr($p['nome'], 0, 1)); ?></div>
                                <div class="post-meta">
                                    <h4 class="post-title"><?php echo htmlspecialchars($p['titulo']); ?></h4>
                                    <div class="post-author">
                                        <?php echo htmlspecialchars($p['nome']); ?> · <?php echo date('d/m/Y H:i', strtotime($p['data_criacao'])); ?>
                                    </div>
                                </div>
                            </div>
                            <span class="post-type-badge" style="background: <?php echo $cor; ?>;">
                                <?php echo ucfirst($p['tipo']); ?>
                            </span>
                        </div>
                        <div class="post-content">
                            <?php echo nl2br(htmlspecialchars($p['conteudo'])); ?>
                        </div>
                        <div class="post-footer">
                            💬 <?php echo $p['total_comentarios']; ?> comentário(s)
                        </div>
                        
                        <!-- Comments -->
                        <div class="comments-section">
                            <?php
                            $result = $comment->listarPorPost($p['id']);
                            $comentarios = [];
                            while ($c = $result->fetch_assoc()) {
                                $comentarios[] = $c;
                            }
                            ?>
                            <?php foreach ($comentarios as $c): ?>
                                <div class="comment-item">
                                    <div class="comment-author">
                                        <?php echo htmlspecialchars($c['nome']); ?>
                                        <span style="font-weight: 400; color: var(--text-muted);">· <?php echo date('d/m H:i', strtotime($c['data_criacao'])); ?></span>
                                    </div>
                                    <div class="comment-text"><?php echo htmlspecialchars($c['conteudo']); ?></div>
                                </div>
                            <?php endforeach; ?>
                            
                            <form method="POST" class="comment-form">
                                <input type="hidden" name="action" value="criar_comentario">
                                <input type="hidden" name="post_id" value="<?php echo $p['id']; ?>">
                                <input type="text" name="conteudo" placeholder="Escreva um comentário..." required>
                                <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1rem;">Enviar</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Sidebar -->
        <div>
            <div class="sidebar-card">
                <div class="sidebar-title">👥 Membros (<?php echo count($membros); ?>)</div>
                <div style="max-height: 400px; overflow-y: auto;">
                    <?php foreach ($membros as $membro): ?>
                        <div class="member-item">
                            <div class="member-avatar"><?php echo strtoupper(substr($membro['nome'], 0, 1)); ?></div>
                            <div>
                                <div class="member-name"><?php echo htmlspecialchars($membro['nome']); ?></div>
                                <div class="member-type"><?php echo ucfirst($membro['tipo']); ?></div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <?php if (!empty($grupo['modulo'])): ?>
                    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">📚 Módulo</p>
                        <p style="font-weight: 600; margin: 0.25rem 0 0;"><?php echo htmlspecialchars($grupo['modulo']); ?></p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
