<?php
/**
 * Dashboard Principal - ISPOTEC.ONLINE
 * Layout responsivo e moderno
 */

$page_title = 'Dashboard';
require_once '../auth/check-auth.php';
require_once '../includes/header.php';

$users_aprovados = 0;
$users_pendentes = 0;
$total_grupos = 0;
$total_posts = 0;

if ($_SESSION['user_tipo'] === 'especialista') {
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE status = 'aprovado'");
    $stmt->execute();
    $users_aprovados = $stmt->get_result()->fetch_assoc()['total'];

    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE status = 'pendente'");
    $stmt->execute();
    $users_pendentes = $stmt->get_result()->fetch_assoc()['total'];

    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM groups");
    $stmt->execute();
    $total_grupos = $stmt->get_result()->fetch_assoc()['total'];

    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM posts");
    $stmt->execute();
    $total_posts = $stmt->get_result()->fetch_assoc()['total'];
}
?>

<div class="container">
    <!-- Logo e Boas-vindas -->
    <div class="welcome-section">
        <img src="../assets/img/logo-ispotec.png" alt="ISPOTEC Online" class="welcome-logo">
        <h1 class="welcome-title">Olá, <?php echo htmlspecialchars($_SESSION['user_nome'] ?? 'Utilizador'); ?>!</h1>
        <p class="welcome-subtitle">
            <span class="user-badge user-badge-<?php echo $_SESSION['user_tipo']; ?>">
                <?php echo ucfirst(htmlspecialchars($_SESSION['user_tipo'])); ?>
            </span>
        </p>
    </div>

    <?php if ($_SESSION['user_tipo'] === 'especialista'): ?>
        <!-- Painel Admin -->
        <div class="stats-grid">
            <div class="stat-card stat-blue">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <div class="stat-number"><?php echo $users_aprovados; ?></div>
                    <div class="stat-label">Utilizadores Aprovados</div>
                </div>
            </div>

            <div class="stat-card stat-orange">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <div class="stat-number"><?php echo $users_pendentes; ?></div>
                    <div class="stat-label">Pendentes de Aprovação</div>
                </div>
            </div>

            <div class="stat-card stat-green">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                    <div class="stat-number"><?php echo $total_grupos; ?></div>
                    <div class="stat-label">Grupos/Disciplinas</div>
                </div>
            </div>

            <div class="stat-card stat-purple">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <div class="stat-number"><?php echo $total_posts; ?></div>
                    <div class="stat-label">Publicações</div>
                </div>
            </div>
        </div>

        <h2 class="section-title">Gestão do Sistema</h2>
        <div class="action-grid">
            <a href="users-pending.php" class="action-card action-orange">
                <div class="action-icon">⏳</div>
                <div class="action-content">
                    <div class="action-title">Utilizadores Pendentes</div>
                    <div class="action-desc">Aprovar ou rejeitar novos registos</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="users-list.php" class="action-card action-blue">
                <div class="action-icon">👥</div>
                <div class="action-content">
                    <div class="action-title">Todos os Utilizadores</div>
                    <div class="action-desc">Ver e gerir utilizadores</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="groups-manage.php" class="action-card action-green">
                <div class="action-icon">📚</div>
                <div class="action-content">
                    <div class="action-title">Disciplinas/Grupos</div>
                    <div class="action-desc">Criar e gerir grupos</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="../chatbot/" class="action-card action-purple">
                <div class="action-icon">🤖</div>
                <div class="action-content">
                    <div class="action-title">Chatbot Académico</div>
                    <div class="action-desc">Testar o assistente virtual</div>
                </div>
                <div class="action-arrow">→</div>
            </a>
        </div>

    <?php else: ?>
        <!-- Painel do Utilizador Normal -->
        <h2 class="section-title">Acesso Rápido</h2>
        <div class="action-grid">
            <a href="my-groups.php" class="action-card action-blue">
                <div class="action-icon">📚</div>
                <div class="action-content">
                    <div class="action-title">Meus Grupos</div>
                    <div class="action-desc">Ver disciplinas e grupos</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="../users/" class="action-card action-purple">
                <div class="action-icon">🔍</div>
                <div class="action-content">
                    <div class="action-title">Encontrar Utilizadores</div>
                    <div class="action-desc">Pesquisar colegas e docentes</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="../profile/" class="action-card action-cyan">
                <div class="action-icon">👤</div>
                <div class="action-content">
                    <div class="action-title">Meu Perfil</div>
                    <div class="action-desc">Ver e editar perfil</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="feed.php" class="action-card action-green">
                <div class="action-icon">📰</div>
                <div class="action-content">
                    <div class="action-title">Feed Geral</div>
                    <div class="action-desc">Ver publicações recentes</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="chat-global.php" class="action-card action-pink">
                <div class="action-icon">💬</div>
                <div class="action-content">
                    <div class="action-title">Forum Global</div>
                    <div class="action-desc">Conversar com todos</div>
                </div>
                <div class="action-arrow">→</div>
            </a>

            <a href="../chatbot/" class="action-card action-indigo">
                <div class="action-icon">🤖</div>
                <div class="action-content">
                    <div class="action-title">Chatbot Académico</div>
                    <div class="action-desc">Tirar dúvidas com IA</div>
                </div>
                <div class="action-arrow">→</div>
            </a>
        </div>
    <?php endif; ?>
</div>

<style>
    .welcome-section {
        text-align: center;
        padding: 2rem 1rem;
        margin-bottom: 1.5rem;
    }

    .welcome-logo {
        max-height: 80px;
        margin-bottom: 1rem;
    }

    .welcome-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }

    .welcome-subtitle {
        color: var(--text-muted);
        font-size: 1rem;
    }

    .user-badge {
        display: inline-block;
        padding: 0.35rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .user-badge-estudante {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: #1e40af;
    }

    .user-badge-docente {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        color: #065f46;
    }

    .user-badge-especialista {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        color: #92400e;
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 1.25rem;
        padding-left: 0.5rem;
        border-left: 4px solid var(--secondary-blue);
    }

    /* Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-bottom: 2.5rem;
    }

    .stat-card {
        background: var(--white);
        border-radius: var(--radius);
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--shadow);
        border-left: 4px solid;
        transition: all 0.2s;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .stat-blue { border-left-color: var(--secondary-blue); }
    .stat-orange { border-left-color: var(--accent-orange); }
    .stat-green { border-left-color: var(--accent-green); }
    .stat-purple { border-left-color: var(--accent-purple); }

    .stat-icon {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--light-gray);
        border-radius: var(--radius-sm);
    }

    .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-dark);
        line-height: 1;
    }

    .stat-label {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
    }

    /* Action Grid */
    .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .action-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--white);
        border-radius: var(--radius);
        text-decoration: none;
        color: var(--text-dark);
        box-shadow: var(--shadow);
        transition: all 0.2s;
        border: 2px solid transparent;
    }

    .action-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .action-blue:hover { border-color: var(--secondary-blue); }
    .action-green:hover { border-color: var(--accent-green); }
    .action-orange:hover { border-color: var(--accent-orange); }
    .action-purple:hover { border-color: var(--accent-purple); }
    .action-pink:hover { border-color: var(--accent-pink); }
    .action-cyan:hover { border-color: #06b6d4; }
    .action-indigo:hover { border-color: #6366f1; }

    .action-icon {
        font-size: 1.75rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
    }

    .action-blue .action-icon { background: #dbeafe; }
    .action-green .action-icon { background: #d1fae5; }
    .action-orange .action-icon { background: #fef3c7; }
    .action-purple .action-icon { background: #ede9fe; }
    .action-pink .action-icon { background: #fce7f3; }
    .action-cyan .action-icon { background: #cffafe; }
    .action-indigo .action-icon { background: #e0e7ff; }

    .action-content {
        flex: 1;
        min-width: 0;
    }

    .action-title {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.25rem;
    }

    .action-desc {
        font-size: 0.85rem;
        color: var(--text-muted);
    }

    .action-arrow {
        font-size: 1.25rem;
        color: var(--text-muted);
        transition: transform 0.2s;
    }

    .action-card:hover .action-arrow {
        transform: translateX(4px);
    }

    /* Mobile */
    @media (max-width: 768px) {
        .welcome-section {
            padding: 1.5rem 0.5rem;
        }

        .welcome-logo {
            max-height: 60px;
        }

        .welcome-title {
            font-size: 1.4rem;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .stat-card {
            padding: 1rem;
        }

        .stat-icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
        }

        .stat-number {
            font-size: 1.5rem;
        }

        .action-grid {
            grid-template-columns: 1fr;
        }

        .action-card {
            padding: 1rem;
        }

        .section-title {
            font-size: 1.1rem;
        }
    }

    @media (max-width: 480px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<?php require_once '../includes/footer.php'; ?>
