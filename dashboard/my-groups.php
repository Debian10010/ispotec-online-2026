<?php
/**
 * Meus Grupos - Utilizador Normal
 * CORRIGIDO: Não fechar conexão cedo para evitar erro "mysqli object already closed"
 */

$page_title = 'Meus Grupos';
require_once '../auth/check-auth.php';
require_once '../includes/header.php';
require_once '../classes/Group.php';

$conn = $conn; // Assuming $conn is defined in header.php
$group = new Group($conn);

$mensagem = '';
$tipo_mensagem = '';

// Processar entrada/saída do grupo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $group_id = intval($_POST['group_id'] ?? 0);
    $acao = $_POST['acao'] ?? '';

    if ($group_id > 0) {
        if ($acao === 'entrar' && !$group->pertenceAoGrupo($group_id, $_SESSION['user_id'])) {
            $group->adicionarMembro($group_id, $_SESSION['user_id']);
            $mensagem = 'Você entrou no grupo com sucesso!';
            $tipo_mensagem = 'success';
        } elseif ($acao === 'sair' && $group->pertenceAoGrupo($group_id, $_SESSION['user_id'])) {
            $group->removerMembro($group_id, $_SESSION['user_id']);
            $mensagem = 'Você saiu do grupo';
            $tipo_mensagem = 'info';
        }
    }
}

// Meus grupos
$meus_grupos = [];
$result = $group->listarPorUtilizador($_SESSION['user_id']);
while ($row = $result->fetch_assoc()) {
    $meus_grupos[] = $row;
}

// Todos os grupos disponíveis
$todos_grupos = [];
$result = $group->listarTodos();
while ($row = $result->fetch_assoc()) {
    $todos_grupos[] = $row;
}

// Cores para os cards (rotativas)
$cores_cards = [
    ['border' => 'var(--secondary-blue)', 'bg' => 'rgba(0, 85, 164, 0.08)', 'icon' => 'var(--secondary-blue)'],
    ['border' => 'var(--accent-green)', 'bg' => 'rgba(16, 185, 129, 0.08)', 'icon' => 'var(--accent-green)'],
    ['border' => 'var(--accent-purple)', 'bg' => 'rgba(139, 92, 246, 0.08)', 'icon' => 'var(--accent-purple)'],
    ['border' => 'var(--accent-orange)', 'bg' => 'rgba(245, 158, 11, 0.08)', 'icon' => 'var(--accent-orange)'],
    ['border' => 'var(--accent-pink)', 'bg' => 'rgba(236, 72, 153, 0.08)', 'icon' => 'var(--accent-pink)'],
];

?>

<style>
    .groups-page {
        padding: 2rem 0 4rem;
    }
    
    .page-hero {
        background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
        color: var(--white);
        padding: 2.5rem 2rem;
        border-radius: var(--radius);
        margin-bottom: 2.5rem;
        position: relative;
        overflow: hidden;
    }
    
    .page-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -10%;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
    }
    
    .page-hero::after {
        content: '';
        position: absolute;
        bottom: -30%;
        left: 10%;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 50%;
    }
    
    .page-hero h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        position: relative;
        z-index: 1;
    }
    
    .page-hero p {
        opacity: 0.9;
        font-size: 1.05rem;
        position: relative;
        z-index: 1;
    }
    
    .hero-icon {
        position: absolute;
        right: 2rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 5rem;
        opacity: 0.15;
    }
    
    .toast-message {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-radius: var(--radius-sm);
        margin-bottom: 2rem;
        animation: slideIn 0.3s ease;
    }
    
    .toast-message.success {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
        border: 1px solid var(--accent-green);
        color: #065f46;
    }
    
    .toast-message.info {
        background: linear-gradient(135deg, rgba(0, 85, 164, 0.1) 0%, rgba(0, 85, 164, 0.05) 100%);
        border: 1px solid var(--secondary-blue);
        color: var(--primary-blue);
    }
    
    .toast-icon {
        font-size: 1.25rem;
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--border-color);
    }
    
    .section-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .section-title h2 {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0;
    }
    
    .section-title .icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }
    
    .section-title .icon.blue {
        background: rgba(0, 85, 164, 0.1);
        color: var(--secondary-blue);
    }
    
    .section-title .icon.green {
        background: rgba(16, 185, 129, 0.1);
        color: var(--accent-green);
    }
    
    .badge-count {
        background: var(--secondary-blue);
        color: var(--white);
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    .groups-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
    
    .group-card {
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: all 0.3s ease;
        border: 1px solid var(--border-color);
    }
    
    .group-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }
    
    .card-accent {
        height: 4px;
    }
    
    .card-body {
        padding: 1.5rem;
    }
    
    .card-header-row {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .group-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .group-info h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 0.25rem;
        line-height: 1.3;
    }
    
    .group-info p {
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .card-stats {
        display: flex;
        gap: 1.5rem;
        padding: 1rem 0;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        margin: 1rem 0;
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .stat-icon {
        font-size: 1rem;
        opacity: 0.7;
    }
    
    .stat-value {
        font-weight: 700;
        color: var(--text-dark);
    }
    
    .stat-label {
        color: var(--text-muted);
        font-size: 0.85rem;
    }
    
    .card-actions {
        display: flex;
        gap: 0.75rem;
    }
    
    .card-actions .btn {
        flex: 1;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
    }
    
    .btn-warning {
        background: linear-gradient(135deg, var(--accent-orange) 0%, #d97706 100%);
        color: var(--white);
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .btn-warning:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
    }
    
    .btn-outline {
        background: transparent;
        color: var(--secondary-blue);
        border: 2px solid var(--secondary-blue);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .btn-outline:hover {
        background: var(--secondary-blue);
        color: var(--white);
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        background: var(--white);
        border-radius: var(--radius);
        border: 2px dashed var(--border-color);
        margin-bottom: 3rem;
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.3;
    }
    
    .empty-state h3 {
        font-size: 1.25rem;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    
    .empty-state p {
        color: var(--text-muted);
        margin-bottom: 1.5rem;
    }
    
    .back-section {
        display: flex;
        justify-content: center;
        padding-top: 1rem;
    }
    
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted);
        text-decoration: none;
        font-weight: 500;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-sm);
        transition: all 0.2s;
        background: var(--white);
        border: 1px solid var(--border-color);
    }
    
    .back-link:hover {
        color: var(--secondary-blue);
        border-color: var(--secondary-blue);
        background: rgba(0, 85, 164, 0.05);
    }
    
    @media (max-width: 768px) {
        .groups-page {
            padding: 1.5rem 0 3rem;
        }
        
        .page-hero {
            padding: 1.75rem 1.5rem;
            margin-bottom: 2rem;
        }
        
        .page-hero h1 {
            font-size: 1.5rem;
        }
        
        .page-hero p {
            font-size: 0.95rem;
        }
        
        .hero-icon {
            display: none;
        }
        
        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }
        
        .groups-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .card-body {
            padding: 1.25rem;
        }
        
        .card-stats {
            gap: 1rem;
        }
        
        .card-actions {
            flex-direction: column;
        }
        
        .empty-state {
            padding: 2rem 1.5rem;
        }
    }
</style>

<div class="container groups-page">
    
    <!-- Page Hero -->
    <div class="page-hero">
        <h1>Disciplinas e Grupos</h1>
        <p>Participe em grupos de estudo e colabore com colegas e docentes</p>
        <span class="hero-icon">&#128218;</span>
    </div>
    
    <!-- Toast Message -->
    <?php if ($mensagem): ?>
        <div class="toast-message <?php echo $tipo_mensagem; ?>">
            <span class="toast-icon"><?php echo $tipo_mensagem === 'success' ? '&#10004;' : '&#8505;'; ?></span>
            <span><?php echo htmlspecialchars($mensagem); ?></span>
        </div>
    <?php endif; ?>
    
    <!-- Meus Grupos Section -->
    <section>
        <div class="section-header">
            <div class="section-title">
                <div class="icon blue">&#128101;</div>
                <h2>Meus Grupos</h2>
            </div>
            <span class="badge-count"><?php echo count($meus_grupos); ?> grupo<?php echo count($meus_grupos) !== 1 ? 's' : ''; ?></span>
        </div>
        
        <?php if (empty($meus_grupos)): ?>
            <div class="empty-state">
                <div class="empty-icon">&#128218;</div>
                <h3>Ainda não está em nenhum grupo</h3>
                <p>Explore os grupos disponíveis abaixo e junte-se a uma comunidade de aprendizagem</p>
                <a href="#grupos-disponiveis" class="btn btn-primary">Ver Grupos Disponíveis</a>
            </div>
        <?php else: ?>
            <div class="groups-grid">
                <?php foreach ($meus_grupos as $index => $g): ?>
                    <?php $cor = $cores_cards[$index % count($cores_cards)]; ?>
                    <div class="group-card">
                        <div class="card-accent" style="background: <?php echo $cor['border']; ?>;"></div>
                        <div class="card-body">
                            <div class="card-header-row">
                                <div class="group-icon" style="background: <?php echo $cor['bg']; ?>; color: <?php echo $cor['icon']; ?>;">
                                    &#128218;
                                </div>
                                <div class="group-info">
                                    <h3><?php echo htmlspecialchars($g['nome']); ?></h3>
                                    <p><?php echo htmlspecialchars($g['descricao'] ?? 'Sem descrição disponível'); ?></p>
                                </div>
                            </div>
                            
                            <div class="card-stats">
                                <div class="stat-item">
                                    <span class="stat-icon">&#128100;</span>
                                    <span class="stat-value"><?php echo $g['total_membros']; ?></span>
                                    <span class="stat-label">membros</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">&#128172;</span>
                                    <span class="stat-value"><?php echo $g['total_posts']; ?></span>
                                    <span class="stat-label">posts</span>
                                </div>
                            </div>
                            
                            <div class="card-actions">
                                <a href="group-view.php?id=<?php echo $g['id']; ?>" class="btn btn-primary">Ver Grupo</a>
                                <form method="POST" style="flex: 1; display: flex;">
                                    <input type="hidden" name="group_id" value="<?php echo $g['id']; ?>">
                                    <input type="hidden" name="acao" value="sair">
                                    <button type="submit" class="btn btn-warning" style="width: 100%;" onclick="return confirm('Tem certeza que deseja sair deste grupo?');">Sair</button>
                                </form>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>
    
    <!-- Grupos Disponíveis Section -->
    <section id="grupos-disponiveis">
        <div class="section-header">
            <div class="section-title">
                <div class="icon green">&#127919;</div>
                <h2>Grupos Disponíveis</h2>
            </div>
        </div>
        
        <?php 
        $grupos_disponiveis = array_filter($todos_grupos, function($g) use ($group) {
            return !$group->pertenceAoGrupo($g['id'], $_SESSION['user_id']);
        });
        ?>
        
        <?php if (empty($grupos_disponiveis)): ?>
            <div class="empty-state">
                <div class="empty-icon">&#127881;</div>
                <h3>Você já está em todos os grupos!</h3>
                <p>Parabéns! Continue participando ativamente nos seus grupos atuais</p>
            </div>
        <?php else: ?>
            <div class="groups-grid">
                <?php foreach ($grupos_disponiveis as $index => $g): ?>
                    <?php $cor = $cores_cards[($index + 2) % count($cores_cards)]; ?>
                    <div class="group-card">
                        <div class="card-accent" style="background: <?php echo $cor['border']; ?>;"></div>
                        <div class="card-body">
                            <div class="card-header-row">
                                <div class="group-icon" style="background: <?php echo $cor['bg']; ?>; color: <?php echo $cor['icon']; ?>;">
                                    &#128218;
                                </div>
                                <div class="group-info">
                                    <h3><?php echo htmlspecialchars($g['nome']); ?></h3>
                                    <p><?php echo htmlspecialchars($g['descricao'] ?? 'Sem descrição disponível'); ?></p>
                                </div>
                            </div>
                            
                            <div class="card-stats">
                                <div class="stat-item">
                                    <span class="stat-icon">&#128100;</span>
                                    <span class="stat-value"><?php echo $g['total_membros']; ?></span>
                                    <span class="stat-label">membros</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">&#128172;</span>
                                    <span class="stat-value"><?php echo $g['total_posts']; ?></span>
                                    <span class="stat-label">posts</span>
                                </div>
                            </div>
                            
                            <div class="card-actions">
                                <form method="POST" style="width: 100%;">
                                    <input type="hidden" name="group_id" value="<?php echo $g['id']; ?>">
                                    <input type="hidden" name="acao" value="entrar">
                                    <button type="submit" class="btn btn-success" style="width: 100%;">
                                        &#10133; Entrar no Grupo
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>
    
    <!-- Back Navigation -->
    <div class="back-section">
        <a href="index.php" class="back-link">
            &#8592; Voltar ao Dashboard
        </a>
    </div>
    
</div>

<?php
require_once '../includes/footer.php';
?>
