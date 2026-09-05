<?php
/**
 * Feed Global - Layout moderno e responsivo
 */

$page_title = 'Feed Global';
require_once '../auth/check-auth.php';
require_once '../includes/header.php';
require_once '../classes/Post.php';
require_once '../classes/Comment.php';

$post = new Post($conn);
$comment = new Comment($conn);

$pagina = intval($_GET['pagina'] ?? 1);
$limit = 10;
$offset = ($pagina - 1) * $limit;

$result = $post->listarFeedGlobal($limit, $offset);
$posts = [];
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

$tipo_cores = [
    'discussao' => ['bg' => '#dbeafe', 'color' => '#1e40af'],
    'material' => ['bg' => '#d1fae5', 'color' => '#065f46'],
    'artigo' => ['bg' => '#ede9fe', 'color' => '#5b21b6'],
    'projeto' => ['bg' => '#fef3c7', 'color' => '#92400e']
];

$tipo_icons = [
    'discussao' => '💬',
    'material' => '📚',
    'artigo' => '📄',
    'projeto' => '🚀'
];
?>

<style>
    .feed-header {
        text-align: center;
        padding: 2rem 1rem;
        margin-bottom: 1.5rem;
    }
    .feed-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0 0 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    .feed-subtitle {
        color: var(--text-muted);
        font-size: 1rem;
    }
    
    .feed-container {
        max-width: 680px;
        margin: 0 auto;
    }
    
    .post-card {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        margin-bottom: 1.25rem;
        overflow: hidden;
        transition: all 0.2s;
    }
    .post-card:hover {
        box-shadow: var(--shadow-lg);
    }
    
    .post-header {
        padding: 1.25rem;
        display: flex;
        gap: 0.75rem;
    }
    .post-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--secondary-blue), #0066cc);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
        flex-shrink: 0;
    }
    .post-meta {
        flex: 1;
        min-width: 0;
    }
    .post-author {
        font-weight: 600;
        color: var(--text-dark);
        font-size: 0.95rem;
    }
    .post-group {
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    .post-group a {
        color: var(--secondary-blue);
        text-decoration: none;
    }
    .post-time {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    .post-type-badge {
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        white-space: nowrap;
    }
    
    .post-title {
        padding: 0 1.25rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0 0 0.5rem;
    }
    .post-content {
        padding: 0 1.25rem 1.25rem;
        color: var(--text-dark);
        line-height: 1.6;
        font-size: 0.95rem;
    }
    .post-content.truncated::after {
        content: '...';
    }
    
    .post-footer {
        padding: 0.75rem 1.25rem;
        background: var(--light-gray);
        border-top: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    .post-stat {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
    }
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    .empty-text {
        color: var(--text-muted);
        margin-bottom: 1.5rem;
    }
    
    .back-nav {
        text-align: center;
        margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
        .feed-header {
            padding: 1.5rem 1rem;
        }
        .feed-title {
            font-size: 1.4rem;
        }
        .post-header {
            padding: 1rem;
        }
        .post-title, .post-content {
            padding-left: 1rem;
            padding-right: 1rem;
        }
        .post-avatar {
            width: 40px;
            height: 40px;
            font-size: 1rem;
        }
    }
</style>

<div class="container">
    <div class="feed-header">
        <h1 class="feed-title">📰 Feed Global</h1>
        <p class="feed-subtitle">Publicações recentes de toda a comunidade ISPOTEC</p>
    </div>
    
    <div class="feed-container">
        <?php if (empty($posts)): ?>
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-title">Nenhuma publicação ainda</div>
                <p class="empty-text">Seja o primeiro a publicar nos seus grupos!</p>
                <a href="my-groups.php" class="btn btn-primary">Ver Meus Grupos</a>
            </div>
        <?php else: ?>
            <?php foreach ($posts as $p): ?>
                <?php 
                $tipo = $p['tipo'] ?? 'discussao';
                $cor = $tipo_cores[$tipo] ?? ['bg' => '#f3f4f6', 'color' => '#374151'];
                $icon = $tipo_icons[$tipo] ?? '📝';
                ?>
                <article class="post-card">
                    <div class="post-header">
                        <div class="post-avatar"><?php echo strtoupper(substr($p['nome'], 0, 1)); ?></div>
                        <div class="post-meta">
                            <div class="post-author"><?php echo htmlspecialchars($p['nome']); ?></div>
                            <?php if (!empty($p['grupo_nome'])): ?>
                                <div class="post-group">em <a href="group-view.php?id=<?php echo $p['group_id']; ?>"><?php echo htmlspecialchars($p['grupo_nome']); ?></a></div>
                            <?php endif; ?>
                            <div class="post-time"><?php echo date('d/m/Y \à\s H:i', strtotime($p['data_criacao'])); ?></div>
                        </div>
                        <span class="post-type-badge" style="background: <?php echo $cor['bg']; ?>; color: <?php echo $cor['color']; ?>;">
                            <?php echo $icon; ?> <?php echo ucfirst($tipo); ?>
                        </span>
                    </div>
                    
                    <h3 class="post-title"><?php echo htmlspecialchars($p['titulo']); ?></h3>
                    <div class="post-content <?php echo strlen($p['conteudo']) > 250 ? 'truncated' : ''; ?>">
                        <?php echo nl2br(htmlspecialchars(substr($p['conteudo'], 0, 250))); ?>
                    </div>
                    
                    <div class="post-footer">
                        <span class="post-stat">💬 <?php echo $p['total_comentarios'] ?? 0; ?> comentários</span>
                        <?php if (!empty($p['group_id'])): ?>
                            <a href="group-view.php?id=<?php echo $p['group_id']; ?>" style="margin-left: auto; color: var(--secondary-blue); text-decoration: none; font-weight: 500;">Ver no grupo →</a>
                        <?php endif; ?>
                    </div>
                </article>
            <?php endforeach; ?>
            
            <!-- Pagination -->
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">
                <?php if ($pagina > 1): ?>
                    <a href="?pagina=<?php echo $pagina - 1; ?>" class="btn btn-secondary">← Anterior</a>
                <?php endif; ?>
                <span class="btn" style="background: var(--light-gray); cursor: default;">Página <?php echo $pagina; ?></span>
                <?php if (count($posts) == $limit): ?>
                    <a href="?pagina=<?php echo $pagina + 1; ?>" class="btn btn-secondary">Próxima →</a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
    
    <div class="back-nav">
        <a href="index.php" class="btn btn-primary">← Voltar ao Dashboard</a>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
