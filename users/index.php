<?php
/**
 * Diretório de Utilizadores - Pesquisar e Ver Perfis
 */

$page_title = 'Diretório de Utilizadores';
require_once '../auth/check-auth.php';
require_once '../includes/header.php';

$user = new User($conn);

// Parâmetros de pesquisa
$search = trim($_GET['q'] ?? '');
$tipo_filtro = $_GET['tipo'] ?? '';

// Query base - ADICIONE 'foto_perfil' aqui
$query = "SELECT id, nome, email, tipo, curso, nivel_academico, foto_perfil FROM users WHERE status = 'aprovado' AND id != ?";
$params = [$_SESSION['user_id']];
$types = 'i';

// Adicionar filtro de pesquisa
if (!empty($search)) {
    $query .= " AND (nome LIKE ? OR email LIKE ?)";
    $search_param = '%' . $search . '%';
    $params[] = $search_param;
    $params[] = $search_param;
    $types .= 'ss';
}

// Adicionar filtro de tipo
if (!empty($tipo_filtro)) {
    $query .= " AND tipo = ?";
    $params[] = $tipo_filtro;
    $types .= 's';
}

$query .= " ORDER BY nome ASC LIMIT 50";

$stmt = $conn->prepare($query);

if (!$stmt) {
    die('Erro na preparação da query: ' . $conn->error);
}

// Bind params dinamicamente
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$utilizadores = [];

while ($row = $result->fetch_assoc()) {
    $utilizadores[] = $row;
}

$stmt->close();

// Cores para avatares baseadas na inicial
$avatar_colors = [
    'A' => '#ef4444', 'B' => '#f97316', 'C' => '#f59e0b', 'D' => '#eab308',
    'E' => '#84cc16', 'F' => '#22c55e', 'G' => '#10b981', 'H' => '#14b8a6',
    'I' => '#06b6d4', 'J' => '#0ea5e9', 'K' => '#3b82f6', 'L' => '#6366f1',
    'M' => '#8b5cf6', 'N' => '#a855f7', 'O' => '#d946ef', 'P' => '#ec4899',
    'Q' => '#f43f5e', 'R' => '#ef4444', 'S' => '#f97316', 'T' => '#f59e0b',
    'U' => '#84cc16', 'V' => '#22c55e', 'W' => '#06b6d4', 'X' => '#3b82f6',
    'Y' => '#8b5cf6', 'Z' => '#ec4899'
];

function getAvatarColor($nome, $colors) {
    $inicial = strtoupper(substr($nome, 0, 1));
    return $colors[$inicial] ?? '#6366f1';
}

function getBadgeStyle($tipo) {
    switch ($tipo) {
        case 'estudante':
            return 'background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff;';
        case 'docente':
            return 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff;';
        case 'especialista':
            return 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff;';
        default:
            return 'background: #64748b; color: #fff;';
    }
}
?>

<style>
    .users-page {
        padding: 2rem 0;
    }
    
    .users-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .users-header-left h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0 0 0.25rem 0;
    }
    
    .users-header-left p {
        color: var(--text-muted);
        margin: 0;
        font-size: 0.95rem;
    }
    
    .users-counter {
        background: linear-gradient(135deg, var(--secondary-blue) 0%, #0066cc 100%);
        color: #fff;
        padding: 0.75rem 1.5rem;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: var(--shadow);
    }
    
    .users-counter-number {
        background: rgba(255,255,255,0.2);
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        font-weight: 700;
    }
    
    /* Search Bar */
    .search-card {
        background: var(--white);
        border-radius: var(--radius);
        padding: 1.25rem;
        box-shadow: var(--shadow);
        margin-bottom: 2rem;
    }
    
    .search-form {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: flex-end;
    }
    
    .search-field {
        flex: 1;
        min-width: 200px;
    }
    
    .search-field label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.4rem;
    }
    
    .search-field input,
    .search-field select {
        width: 100%;
        padding: 0.7rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-sm);
        font-size: 0.95rem;
        transition: all 0.2s;
        background: var(--light-gray);
    }
    
    .search-field input:focus,
    .search-field select:focus {
        outline: none;
        border-color: var(--secondary-blue);
        background: var(--white);
        box-shadow: 0 0 0 3px rgba(0, 85, 164, 0.1);
    }
    
    .search-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .search-actions .btn {
        padding: 0.7rem 1.25rem;
        white-space: nowrap;
    }
    
    /* Users Grid */
    .users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.25rem;
    }
    
    /* User Card */
    .user-card {
        background: var(--white);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
    }
    
    .user-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--secondary-blue), var(--accent-purple));
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .user-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: transparent;
    }
    
    .user-card:hover::before {
        opacity: 1;
    }
    
    .user-card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .user-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        overflow: hidden; /* Adicionado */
        position: relative; /* Adicionado */
    }
    
    .user-info {
        flex: 1;
        min-width: 0;
    }
    
    .user-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0 0 0.35rem 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .user-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .user-card-body {
        flex: 1;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }
    
    .user-detail {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.6rem;
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    
    .user-detail-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        opacity: 0.6;
    }
    
    .user-detail-value {
        word-break: break-word;
    }
    
    .user-card-footer {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }
    
    .user-card-footer .btn {
        width: 100%;
    }
    
    /* Empty State */
    .empty-state {
        background: var(--white);
        border-radius: var(--radius);
        padding: 4rem 2rem;
        text-align: center;
        box-shadow: var(--shadow-sm);
        border: 2px dashed var(--border-color);
    }
    
    .empty-state-icon {
        width: 80px;
        height: 80px;
        background: var(--light-gray);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
    }
    
    .empty-state-icon svg {
        width: 40px;
        height: 40px;
        color: var(--text-muted);
    }
    
    .empty-state h3 {
        font-size: 1.25rem;
        color: var(--text-dark);
        margin: 0 0 0.5rem 0;
    }
    
    .empty-state p {
        color: var(--text-muted);
        margin: 0 0 1.5rem 0;
    }
    
    .back-link {
        margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
        .users-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .users-counter {
            align-self: flex-start;
        }
        
        .search-form {
            flex-direction: column;
        }
        
        .search-field {
            min-width: 100%;
        }
        
        .search-actions {
            width: 100%;
        }
        
        .search-actions .btn {
            flex: 1;
        }
        
        .users-grid {
            grid-template-columns: 1fr;
        }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
        .users-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>

<div class="container users-page">
    <!-- Page Header -->
    <div class="users-header">
        <div class="users-header-left">
            <h1>Diretório de Utilizadores</h1>
            <p>Encontre colegas e explore perfis académicos</p>
        </div>
        <div class="users-counter">
            <span>Encontrados</span>
            <span class="users-counter-number"><?php echo count($utilizadores); ?></span>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="search-card">
        <form method="GET" class="search-form">
            <div class="search-field">
                <label for="q">Nome ou Email</label>
                <input type="text" id="q" name="q" value="<?php echo htmlspecialchars($search); ?>" placeholder="Pesquisar...">
            </div>

            <div class="search-field" style="flex: 0.6;">
                <label for="tipo">Tipo</label>
                <select id="tipo" name="tipo">
                    <option value="">Todos</option>
                    <option value="estudante" <?php echo $tipo_filtro === 'estudante' ? 'selected' : ''; ?>>Estudante</option>
                    <option value="docente" <?php echo $tipo_filtro === 'docente' ? 'selected' : ''; ?>>Docente</option>
                    <option value="especialista" <?php echo $tipo_filtro === 'especialista' ? 'selected' : ''; ?>>Especialista</option>
                </select>
            </div>

            <div class="search-actions">
                <button type="submit" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    Pesquisar
                </button>
                <?php if (!empty($search) || !empty($tipo_filtro)): ?>
                    <a href="index.php" class="btn btn-secondary">Limpar</a>
                <?php endif; ?>
            </div>
        </form>
    </div>

    <!-- Results -->
    <?php if (empty($utilizadores)): ?>
        <div class="empty-state">
            <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <h3>Nenhum utilizador encontrado</h3>
            <p>Tente ajustar os filtros de pesquisa ou remova alguns critérios</p>
            <?php if (!empty($search) || !empty($tipo_filtro)): ?>
                <a href="index.php" class="btn btn-primary">Ver todos os utilizadores</a>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="users-grid">
            <?php foreach ($utilizadores as $util): 
                $avatar_color = getAvatarColor($util['nome'], $avatar_colors);
                $badge_style = getBadgeStyle($util['tipo']);
            ?>
                <div class="user-card">
                    <div class="user-card-header">
                        <div class="user-avatar">
                            <?php 
                            // Verifica se o usuário tem foto de perfil
                            if (!empty($util['foto_perfil']) && file_exists('../' . $util['foto_perfil'])): 
                                $foto_url = '../' . htmlspecialchars($util['foto_perfil']);
                            ?>
                                <img src="<?php echo $foto_url; ?>" 
                                     alt="<?php echo htmlspecialchars($util['nome']); ?>" 
                                     style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                            <?php else: ?>
                                <!-- Avatar com inicial se não tiver foto -->
                                <div style="width: 100%; height: 100%; border-radius: 50%; background: <?php echo $avatar_color; ?>; 
                                            display: flex; align-items: center; justify-content: center; 
                                            color: #fff; font-size: 1.5rem; font-weight: 700;">
                                    <?php echo strtoupper(substr($util['nome'], 0, 1)); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="user-info">
                            <h4 class="user-name"><?php echo htmlspecialchars($util['nome']); ?></h4>
                            <span class="user-badge" style="<?php echo $badge_style; ?>">
                                <?php echo htmlspecialchars($util['tipo']); ?>
                            </span>
                        </div>
                    </div>

                    <div class="user-card-body">
                        <div class="user-detail">
                            <svg class="user-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <span class="user-detail-value"><?php echo htmlspecialchars($util['email']); ?></span>
                        </div>
                        <div class="user-detail">
                            <svg class="user-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                            <span class="user-detail-value"><?php echo htmlspecialchars($util['curso'] ?: 'Não informado'); ?></span>
                        </div>
                        <div class="user-detail">
                            <svg class="user-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20V10"></path>
                                <path d="M18 20V4"></path>
                                <path d="M6 20v-4"></path>
                            </svg>
                            <span class="user-detail-value"><?php echo htmlspecialchars($util['nivel_academico'] ?: 'Não informado'); ?></span>
                        </div>
                    </div>

                    <div class="user-card-footer">
                        <a href="../profile/view.php?id=<?php echo $util['id']; ?>" class="btn btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Ver Perfil
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <div class="back-link">
        <a href="../dashboard/" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5"></path>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar ao Dashboard
        </a>
    </div>
</div>

<?php
require_once '../includes/footer.php';
?>