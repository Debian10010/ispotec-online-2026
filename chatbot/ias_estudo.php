<?php
// ias_estudo.php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/Chatbot.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

$page_title = 'Ferramentas IA para Estudo';
require_once '../includes/header.php';
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --primary-blue: #4f46e5;
            --primary-purple: #7c3aed;
            --accent-green: #10b981;
            --accent-orange: #f59e0b;
            --text-dark: #1f2937;
            --text-muted: #6b7280;
            --light-bg: #f8fafc;
            --card-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            --hover-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: var(--text-dark);
            min-height: 100vh;
        }
        
        .navbar-glass {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        
        .hero-section {
            background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
            color: white;
            padding: 4rem 0;
            margin-bottom: 3rem;
            border-radius: 0 0 2rem 2rem;
        }
        
        .hero-title {
            font-size: 3.2rem;
            font-weight: 800;
            margin-bottom: 1rem;
        }
        
        .hero-subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 700px;
            margin: 0 auto 2rem;
        }
        
        .feature-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50px;
            font-size: 0.9rem;
            margin: 0 0.3rem 0.5rem;
        }
        
        .card-tool {
            border: none;
            border-radius: 1.2rem;
            overflow: hidden;
            background: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
            position: relative;
            box-shadow: var(--card-shadow);
        }
        
        .card-tool:hover {
            transform: translateY(-10px);
            box-shadow: var(--hover-shadow);
        }
        
        .card-icon {
            width: 70px;
            height: 70px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 1.5rem;
            transition: all 0.3s;
        }
        
        .card-tool:hover .card-icon {
            transform: scale(1.1);
        }
        
        .tool-category {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--light-bg);
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
        }
        
        .tool-btn {
            padding: 0.7rem 1.8rem;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s;
            border: none;
        }
        
        .tool-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .tool-btn i {
            font-size: 0.9rem;
        }
        
        .search-box {
            max-width: 600px;
            margin: 2rem auto;
            position: relative;
        }
        
        .search-box input {
            border-radius: 50px;
            padding: 1rem 1.5rem 1rem 3rem;
            border: 2px solid #e5e7eb;
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .search-box input:focus {
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 1.2rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }
        
        .filter-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 2rem 0;
        }
        
        .filter-btn {
            padding: 0.5rem 1.2rem;
            border-radius: 50px;
            border: 2px solid #e5e7eb;
            background: white;
            color: var(--text-dark);
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .filter-btn:hover, .filter-btn.active {
            background: var(--primary-blue);
            color: white;
            border-color: var(--primary-blue);
        }
        
        .back-to-chat {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            text-decoration: none;
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
            transition: all 0.3s;
            z-index: 100;
        }
        
        .back-to-chat:hover {
            transform: scale(1.1);
            color: white;
        }
        
        .stats-container {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: var(--card-shadow);
            margin-bottom: 3rem;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .stat-label {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.2rem;
            }
            
            .hero-section {
                padding: 3rem 0;
                border-radius: 0 0 1.5rem 1.5rem;
            }
            
            .back-to-chat {
                bottom: 1rem;
                right: 1rem;
                width: 50px;
                height: 50px;
                font-size: 1.2rem;
            }
        }
        
        .tool-description {
            color: var(--text-muted);
            font-size: 0.95rem;
            line-height: 1.6;
            min-height: 72px;
        }
    </style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-glass">
    <div class="container">
        <a class="navbar-brand fw-bold" href="../dashboard/">
            <i class="fas fa-graduation-cap me-2"></i>ISPOTEC IA
        </a>
        <div class="d-flex align-items-center">
            <a href="index.php" class="btn btn-outline-primary me-2">
                <i class="fas fa-robot me-1"></i>Chatbot
            </a>
            <a href="../dashboard/" class="btn btn-link text-dark">
                <i class="fas fa-home"></i>
            </a>
        </div>
    </div>
</nav>

<!-- Hero Section -->
<div class="hero-section">
    <div class="container text-center">
        <h1 class="hero-title">🚀 Assistentes de IA para Estudantes</h1>
        <p class="hero-subtitle">
            Descubra as melhores ferramentas inteligentes para maximizar seu aprendizado, 
            pesquisa e produtividade académica
        </p>
        
        <div class="mt-4">
            <span class="feature-badge"><i class="fas fa-bolt me-1"></i>Rápido</span>
            <span class="feature-badge"><i class="fas fa-shield-alt me-1"></i>Confiável</span>
            <span class="feature-badge"><i class="fas fa-graduation-cap me-1"></i>Educacional</span>
            <span class="feature-badge"><i class="fas fa-rocket me-1"></i>Produtivo</span>
        </div>
    </div>
</div>

<div class="container py-4">
    
    <!-- Search & Filters -->
    <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" class="form-control" id="searchTools" 
               placeholder="Pesquisar ferramentas (ex: PDF, flashcards, pesquisa)...">
    </div>
    
    <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">Todas</button>
        <button class="filter-btn" data-filter="tutoring">Tutoria</button>
        <button class="filter-btn" data-filter="research">Pesquisa</button>
        <button class="filter-btn" data-filter="writing">Escrita</button>
        <button class="filter-btn" data-filter="study">Estudo</button>
    </div>
    
    <!-- Stats -->
    <div class="stats-container">
        <div class="row text-center">
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-item">
                    <div class="stat-number">6+</div>
                    <div class="stat-label">Ferramentas</div>
                </div>
            </div>
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-item">
                    <div class="stat-number">4</div>
                    <div class="stat-label">Categorias</div>
                </div>
            </div>
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-item">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Gratuitas</div>
                </div>
            </div>
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-item">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Disponível</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Tools Grid -->
    <div class="row g-4" id="toolsGrid">
        
        <!-- ChatGPT -->
        <div class="col-lg-4 col-md-6" data-categories="tutoring writing">
            <div class="card-tool">
                <div class="card-body p-4 text-center">
                    <span class="tool-category">Tutoria</span>
                    <div class="card-icon" style="background: linear-gradient(135deg, #10a37f, #10b981); color: white;">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h4 class="card-title fw-bold mb-3">ChatGPT</h4>
                    <p class="tool-description mb-4">
                        Explica conceitos complexos, tira dúvidas em tempo real, ajuda com 
                        exercícios e fornece explicações detalhadas em qualquer disciplina.
                    </p>
                    <a href="https://chat.openai.com" target="_blank" 
                       class="tool-btn" 
                       style="background: linear-gradient(135deg, #10a37f, #10b981); color: white;">
                        <i class="fas fa-external-link-alt"></i> Acessar ChatGPT
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Perplexity -->
        <div class="col-lg-4 col-md-6" data-categories="research">
            <div class="card-tool">
                <div class="card-body p-4 text-center">
                    <span class="tool-category">Pesquisa</span>
                    <div class="card-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;">
                        <i class="fas fa-search"></i>
                    </div>
                    <h4 class="card-title fw-bold mb-3">Perplexity AI</h4>
                    <p class="tool-description mb-4">
                        Pesquisa académica com citação de fontes confiáveis. Ideal para 
                        trabalhos científicos, artigos e referências bibliográficas precisas.
                    </p>
                    <a href="https://www.perplexity.ai" target="_blank" 
                       class="tool-btn" 
                       style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;">
                        <i class="fas fa-search"></i> Pesquisar Agora
                    </a>
                </div>
            </div>
        </div>
        
        <!-- NotebookLM -->
        <div class="col-lg-4 col-md-6" data-categories="research study">
            <div class="card-tool">
                <div class="card-body p-4 text-center">
                    <span class="tool-category">Análise</span>
                    <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h4 class="card-title fw-bold mb-3">NotebookLM</h4>
                    <p class="tool-description mb-4">
                        Carregue PDFs, artigos e documentos para receber explicações, 
                        resumos e insights inteligentes sobre o conteúdo.
                    </p>
                    <a href="https://notebooklm.google.com" target="_blank" 
                       class="tool-btn" 
                       style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">
                        <i class="fas fa-upload"></i> Analisar PDF
                    </a>
                </div>
            </div>
        </div>
        
        <!-- QuillBot -->
        <div class="col-lg-4 col-md-6" data-categories="writing">
            <div class="card-tool">
                <div class="card-body p-4 text-center">
                    <span class="tool-category">Escrita</span>
                    <div class="card-icon" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white;">
                        <i class="fas fa-edit"></i>
                    </div>
                    <h4 class="card-title fw-bold mb-3">QuillBot</h4>
                    <p class="tool-description mb-4">
                        Reescreva, parafraseie, corrija gramática e melhore a qualidade 
                        de textos académicos. Ideal para trabalhos e artigos.
                    </p>
                    <a href="https://quillbot.com" target="_blank" 
                       class="tool-btn" 
                       style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white;">
                        <i class="fas fa-pen-fancy"></i> Reescrever Texto
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Quizlet -->
        <div class="col-lg-4 col-md-6" data-categories="study">
            <div class="card-tool">
                <div class="card-body p-4 text-center">
                    <span class="tool-category">Memorização</span>
                    <div class="card-icon" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white;">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h4 class="card-title fw-bold mb-3">Quizlet</h4>
                    <p class="tool-description mb-4">
                        Crie e estude com flashcards inteligentes, testes automáticos e 
                        jogos educativos para melhorar a retenção de informação.
                    </p>
                    <a href="https://quizlet.com" target="_blank" 
                       class="tool-btn" 
                       style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white;">
                        <i class="fas fa-graduation-cap"></i> Estudar Agora
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Gemini -->
        <div class="col-lg-4 col-md-6" data-categories="tutoring research writing">
            <div class="card-tool">
                <div class="card-body p-4 text-center">
                    <span class="tool-category">Multifuncional</span>
                    <div class="card-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white;">
                        <i class="fas fa-gem"></i>
                    </div>
                    <h4 class="card-title fw-bold mb-3">Gemini (Google)</h4>
                    <p class="tool-description mb-4">
                        Assistente IA completo do Google para estudo, pesquisa, escrita, 
                        organização e resolução de problemas académicos.
                    </p>
                    <a href="https://gemini.google.com" target="_blank" 
                       class="tool-btn" 
                       style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white;">
                        <i class="fas fa-external-link-alt"></i> Acessar Gemini
                    </a>
                </div>
            </div>
        </div>
        
    </div>
    
    <!-- Additional Tools Section -->
    <div class="mt-5 pt-4 border-top">
        <h3 class="fw-bold mb-4 text-center">📚 Mais Recursos para Estudo</h3>
        <div class="row g-3">
            <div class="col-md-6">
                <div class="d-flex align-items-center p-3 bg-white rounded-3 shadow-sm">
                    <div class="bg-light rounded-2 p-3 me-3">
                        <i class="fas fa-book text-primary fa-lg"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Khan Academy</h6>
                        <p class="text-muted small mb-0">Videoaulas e exercícios em diversas disciplinas</p>
                    </div>
                    <a href="https://www.khanacademy.org" target="_blank" class="btn btn-sm btn-outline-primary ms-auto">
                        Acessar
                    </a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="d-flex align-items-center p-3 bg-white rounded-3 shadow-sm">
                    <div class="bg-light rounded-2 p-3 me-3">
                        <i class="fas fa-language text-success fa-lg"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">DeepL Tradutor</h6>
                        <p class="text-muted small mb-0">Tradução precisa de textos académicos</p>
                    </div>
                    <a href="https://www.deepl.com" target="_blank" class="btn btn-sm btn-outline-success ms-auto">
                        Traduzir
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="text-center mt-5 pt-4 border-top">
        <div class="row align-items-center">
            <div class="col-md-6 text-md-start mb-3 mb-md-0">
                <a href="index.php" class="btn btn-outline-primary">
                    <i class="fas fa-arrow-left me-2"></i>Voltar ao Chatbot
                </a>
            </div>
            <div class="col-md-6 text-md-end">
                <small class="text-muted">
                    <i class="fas fa-shield-alt me-1"></i>
                    Estas ferramentas são externas ao ISPOTEC. Use com responsabilidade académica.
                </small>
            </div>
        </div>
    </div>

</div>

<!-- Floating Back Button -->
<a href="index.php" class="back-to-chat" title="Voltar ao Chatbot">
    <i class="fas fa-robot"></i>
</a>

<!-- JavaScript -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tools = document.querySelectorAll('#toolsGrid > div');
    const searchInput = document.getElementById('searchTools');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            tools.forEach(tool => {
                if (filter === 'all') {
                    tool.style.display = 'block';
                } else {
                    const categories = tool.getAttribute('data-categories');
                    if (categories.includes(filter)) {
                        tool.style.display = 'block';
                    } else {
                        tool.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        tools.forEach(tool => {
            const title = tool.querySelector('.card-title').textContent.toLowerCase();
            const description = tool.querySelector('.tool-description').textContent.toLowerCase();
            const category = tool.querySelector('.tool-category').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                category.includes(searchTerm)) {
                tool.style.display = 'block';
            } else {
                tool.style.display = 'none';
            }
        });
    });
    
    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards for animation
    document.querySelectorAll('.card-tool').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});
</script>

<?php require_once '../includes/footer.php'; ?>
</body>
</html>