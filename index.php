<?php
/**
 * Página Inicial - ISPOTEC.ONLINE
 * Landing page moderna e responsiva
 */

$page_title = 'Página Inicial';
require_once 'includes/header.php';
?>

<style>
    /* Hero Section */
    .hero {
        background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 50%, #004080 100%);
        color: white;
        padding: 4rem 1rem;
        margin: -1.5rem -1rem 0;
        position: relative;
        overflow: hidden;
    }
    .hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 60%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
        pointer-events: none;
    }
    .hero::after {
        content: '';
        position: absolute;
        bottom: -30%;
        left: -10%;
        width: 40%;
        height: 150%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%);
        pointer-events: none;
    }
    .hero-content {
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
        position: relative;
        z-index: 1;
    }
    .hero-logo {
        width: 100px;
        height: 100px;
        margin-bottom: 1.5rem;
        filter: drop-shadow(0 4px 20px rgba(0,0,0,0.3));
        animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    .hero-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
        line-height: 1.2;
    }
    .hero-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
        margin-bottom: 2rem;
        font-weight: 400;
    }
    .hero-badge {
        display: inline-block;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
    }
    .hero-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    .hero-btn {
        padding: 0.9rem 2rem;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    .hero-btn-primary {
        background: linear-gradient(135deg, var(--accent-green), #059669);
        color: white;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }
    .hero-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }
    .hero-btn-secondary {
        background: rgba(255,255,255,0.15);
        color: white;
        border: 2px solid rgba(255,255,255,0.3);
    }
    .hero-btn-secondary:hover {
        background: rgba(255,255,255,0.25);
        border-color: rgba(255,255,255,0.5);
    }
    
    /* Logged in user */
    .hero-user {
        margin-top: 1rem;
    }
    .hero-user-name {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    .hero-user-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-green), #059669);
        color: white;
        font-size: 2rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        border: 4px solid rgba(255,255,255,0.3);
    }
    
    /* Features Section */
    .features {
        padding: 4rem 0;
    }
    .features-title {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    .features-subtitle {
        text-align: center;
        color: var(--text-muted);
        margin-bottom: 3rem;
    }
    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }
    .feature-card {
        background: var(--white);
        border-radius: var(--radius);
        padding: 2rem;
        box-shadow: var(--shadow);
        transition: all 0.3s;
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
    }
    .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--secondary-blue), var(--accent-green));
        opacity: 0;
        transition: opacity 0.3s;
    }
    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
        border-color: var(--border-color);
    }
    .feature-card:hover::before {
        opacity: 1;
    }
    .feature-icon {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1.25rem;
    }
    .feature-icon.blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
    .feature-icon.green { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .feature-icon.purple { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .feature-icon.orange { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .feature-icon.pink { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
    .feature-icon.cyan { background: linear-gradient(135deg, #cffafe, #a5f3fc); }
    .feature-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    .feature-desc {
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    /* Stats Section */
    .stats {
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        padding: 3rem 0;
        margin: 0 -1rem;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 2rem;
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    .stat-item {
        padding: 1rem;
    }
    .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--secondary-blue);
        line-height: 1;
    }
    .stat-label {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
    
    /* CTA Section */
    .cta {
        text-align: center;
        padding: 4rem 1rem;
    }
    .cta-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    .cta-text {
        color: var(--text-muted);
        margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .hero {
            padding: 3rem 1rem;
        }
        .hero-title {
            font-size: 1.75rem;
        }
        .hero-subtitle {
            font-size: 1rem;
        }
        .hero-logo {
            width: 80px;
            height: 80px;
        }
        .hero-btn {
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
        }
        .features {
            padding: 2.5rem 0;
        }
        .features-title {
            font-size: 1.4rem;
        }
        .feature-card {
            padding: 1.5rem;
        }
        .stat-number {
            font-size: 2rem;
        }


        
    }
    .quick-links-sidebar {
    position: sticky;
    top: 1rem;
    margin-bottom: 2rem;
}

.sidebar-section {
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.sidebar-title {
    background: linear-gradient(135deg, var(--secondary-blue), var(--accent-purple));
    color: white;
    padding: 1rem;
    margin: 0;
    font-size: 1rem;
}

.sidebar-content {
    padding: 1rem;
}

.sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    text-decoration: none;
    color: var(--text-dark);
    border-radius: var(--radius-sm);
    margin-bottom: 0.5rem;
    transition: all 0.2s;
}

.sidebar-link:hover {
    background: var(--light-gray);
    transform: translateX(3px);
}

.sidebar-icon {
    font-size: 1.25rem;
    width: 30px;
    text-align: center;
}

.sidebar-text {
    font-weight: 500;
}

.sidebar-whatsapp:hover { color: #25D366; }
.sidebar-facebook:hover { color: #1877F2; }
.sidebar-academic:hover { color: var(--secondary-blue); }
.sidebar-moodle:hover { color: #F98012; }
.sidebar-library:hover { color: #8B4513; }

.contact-info {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--light-gray);
}

.contact-info-title {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
}

.contact-info-item {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    color: var(--text-dark);
}

.contact-email {
    color: var(--secondary-blue);
    text-decoration: none;
}

.contact-email:hover {
    text-decoration: underline;
}
</style>

<!-- Hero Section -->
<section class="hero">
    <div class="hero-content">
        <img src="<?php echo SITE_URL; ?>assets/img/logo-ispotec.png" alt="ISPOTEC" class="hero-logo">
        
        <?php if (!Auth::estaAutenticado()): ?>
            <div class="hero-badge">🎓 Rede Social Académica</div>
            <h1 class="hero-title">Bem-vindo à ISPOTEC Online</h1>
            <p class="hero-subtitle">Plataforma de aprendizagem colaborativa do Instituto Superior Politécnico e de Tecnologias</p>
            
            <div class="hero-buttons">
                <a href="auth/login.php" class="hero-btn hero-btn-secondary">
                    Entrar
                </a>
                <a href="auth/register.php" class="hero-btn hero-btn-primary">
                    Criar Conta Grátis →
                </a>
            </div>
        <?php else: ?>
            <div class="hero-user">
                <div class="hero-user-avatar">
                    <?php echo strtoupper(substr($_SESSION['user_nome'] ?? 'U', 0, 1)); ?>
                </div>
                <p class="hero-user-name">Olá, <?php echo htmlspecialchars($_SESSION['user_nome']); ?>! 👋</p>
                <div class="hero-buttons">
                    <a href="dashboard/" class="hero-btn hero-btn-primary">
                        Ir para Dashboard →
                    </a>
                </div>
            </div>
        <?php endif; ?>
    </div>
</section>

<div class="container">
    <!-- Features Section -->
    <section class="features">
        <h2 class="features-title">O que pode fazer na ISPOTEC Online</h2>
        <p class="features-subtitle">Ferramentas para potenciar a sua experiência académica</p>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon blue">👥</div>
                <h3 class="feature-title">Grupos de Estudo</h3>
                <p class="feature-desc">Participe em grupos por disciplina, partilhe materiais e colabore com colegas em projetos.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon green">💼</div>
                <h3 class="feature-title">Portfólio Académico</h3>
                <p class="feature-desc">Crie e partilhe o seu portfólio com trabalhos, projetos e certificações.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon purple">🤖</div>
                <h3 class="feature-title">Chatbot Inteligente</h3>
                <p class="feature-desc">Tire dúvidas académicas a qualquer hora com o nosso assistente virtual.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon orange">💬</div>
                <h3 class="feature-title">Chat em Tempo Real</h3>
                <p class="feature-desc">Converse com colegas e docentes através de chat individual ou em grupo.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon pink">📰</div>
                <h3 class="feature-title">Feed de Publicações</h3>
                <p class="feature-desc">Acompanhe as últimas publicações, artigos e discussões da comunidade.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon cyan">🔍</div>
                <h3 class="feature-title">Encontrar Colegas</h3>
                <p class="feature-desc">Pesquise e conecte-se com estudantes, docentes e especialistas.</p>
            </div>
        </div>
    </section>
</div>

<!-- Stats Section -->
<section class="stats">
    <div class="stats-grid">
        <div class="stat-item">
            <div class="stat-number">100%</div>
            <div class="stat-label">Gratuito</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Disponível</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">🔒</div>
            <div class="stat-label">Seguro</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">📱</div>
            <div class="stat-label">Mobile-friendly</div>
        </div>
    </div>
</section>

<div class="container">
    <!-- CTA Section -->
    <?php if (!Auth::estaAutenticado()): ?>
    <section class="cta">
        <h2 class="cta-title">Pronto para começar?</h2>
        <p class="cta-text">Junte-se à comunidade ISPOTEC e potencialize a sua aprendizagem</p>
        <a href="auth/register.php" class="btn btn-success" style="padding: 0.9rem 2.5rem; font-size: 1rem;">
            Criar Conta Grátis
        </a>
    </section>
    <?php endif; ?>
</div>

<?php require_once 'includes/footer.php'; ?>
