<?php
/**
 * Cabeçalho da Plataforma
 * Layout responsivo moderno com suporte a dispositivos móveis
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once dirname(dirname(__FILE__)) . '/config/config.php';
require_once dirname(dirname(__FILE__)) . '/config/database.php';
require_once CLASSES_PATH . 'Auth.php';
require_once CLASSES_PATH . 'User.php';

?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#001f3f">
    <title><?php echo isset($page_title) ? htmlspecialchars($page_title) . ' | ' . APP_NAME : APP_NAME; ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-blue: #4f46e5;
            --secondary-blue: #0055a4;
            --accent-green: #10b981;
            --accent-purple: #8b5cf6;
            --accent-pink: #ec4899;
            --accent-orange: #f59e0b;
            --light-gray: #f8fafc;
            --text-dark: #1e293b;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --white: #ffffff;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
            --radius: 12px;
            --radius-sm: 8px;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--light-gray);
            color: var(--text-dark);
            line-height: 1.6;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        /* Header */
        header {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: var(--white);
            padding: 0.75rem 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: var(--white);
        }

        .logo img {
            height: 45px;
            width: auto;
        }

        .logo-text {
            display: flex;
            flex-direction: column;
        }

        .logo-text strong {
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .logo-text small {
            font-size: 0.65rem;
            opacity: 0.85;
            font-weight: 400;
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--white);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: var(--radius-sm);
            transition: background 0.2s;
        }

        .menu-toggle:hover {
            background: rgba(255,255,255,0.1);
        }

        .hamburger {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .hamburger span {
            display: block;
            width: 24px;
            height: 2px;
            background: var(--white);
            border-radius: 2px;
            transition: all 0.3s;
        }

        /* Navigation Menu */
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 0.25rem;
            align-items: center;
        }

        .nav-menu a {
            color: var(--white);
            text-decoration: none;
            padding: 0.6rem 1rem;
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .nav-menu a:hover {
            background: rgba(255,255,255,0.15);
        }

        .nav-menu a.nav-logout {
            background: rgba(239, 68, 68, 0.2);
        }

        .nav-menu a.nav-logout:hover {
            background: rgba(239, 68, 68, 0.4);
        }

        .nav-user {
            background: rgba(255,255,255,0.1);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.85rem;
        }

        /* Dropdown de Contactos */
        .contacts-dropdown {
            position: relative;
        }
        
        .contacts-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.6rem 1rem;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
            background: none;
            border: none;
            color: var(--white);
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .contacts-toggle:hover {
            background: rgba(255,255,255,0.15);
        }
        
        .contacts-icon {
            font-size: 1.1rem;
        }
        
        .contacts-dropdown-content {
            position: absolute;
            top: 100%;
            right: 0;
            width: 350px;
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            padding: 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1001;
            margin-top: 0.5rem;
            overflow: hidden;
        }
        
        .contacts-dropdown.active .contacts-dropdown-content {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .contacts-header {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: var(--white);
            padding: 1rem 1.25rem;
        }
        
        .contacts-header h3 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .contacts-body {
            padding: 1.5rem;
        }
        
        .contact-group {
            margin-bottom: 1.5rem;
        }
        
        .contact-group:last-child {
            margin-bottom: 0;
        }
        
        .group-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--light-gray);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .contact-items {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
            text-decoration: none;
            color: var(--text-dark);
        }
        
        .contact-item:hover {
            background: var(--light-gray);
            transform: translateX(5px);
        }
        
        .contact-item-link:hover {
            color: var(--secondary-blue);
        }
        
        .contact-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--light-gray);
            border-radius: 8px;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        
        .contact-details {
            flex: 1;
            min-width: 0;
        }
        
        .contact-title {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 0.25rem;
        }
        
        .contact-info {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .external-icon {
            font-size: 0.8rem;
            opacity: 0.5;
            margin-left: auto;
        }

        /* Botão WhatsApp Fixo */
        .whatsapp-fixed {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #25D366;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            font-size: 1.5rem;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
            z-index: 999;
            transition: all 0.3s;
        }
        
        .whatsapp-fixed:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--secondary-blue) 0%, #0066cc 100%);
            color: var(--white);
            box-shadow: 0 2px 4px rgba(0, 85, 164, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 85, 164, 0.4);
        }

        .btn-success {
            background: linear-gradient(135deg, var(--accent-green) 0%, #059669 100%);
            color: var(--white);
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        .btn-success:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: var(--white);
        }

        .btn-danger:hover {
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: var(--white);
            color: var(--text-dark);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: var(--light-gray);
        }

        /* Forms */
        .form-group {
            margin-bottom: 1.25rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            font-size: 0.9rem;
            color: var(--text-dark);
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        input[type="date"],
        input[type="file"],
        textarea,
        select {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 1rem;
            font-family: inherit;
            background: var(--white);
            transition: all 0.2s;
        }

        input:focus,
        textarea:focus,
        select:focus {
            outline: none;
            border-color: var(--secondary-blue);
            box-shadow: 0 0 0 3px rgba(0, 85, 164, 0.15);
        }

        textarea {
            min-height: 120px;
            resize: vertical;
        }

        /* Alerts */
        .alert {
            padding: 1rem 1.25rem;
            border-radius: var(--radius-sm);
            margin-bottom: 1.5rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .alert-success {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
            border: 1px solid #6ee7b7;
        }

        .alert-error {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            border: 1px solid #fca5a5;
        }

        .alert-info {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
        }

        .alert-warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border: 1px solid #fcd34d;
        }

        /* Main Content */
        main {
            padding: 1.5rem 0 3rem;
            min-height: calc(100vh - 180px);
        }

        /* Cards */
        .card {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 1.5rem;
            transition: all 0.2s;
        }

        .card:hover {
            box-shadow: var(--shadow-lg);
        }

        .card-header {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }

        /* Tables */
        .table-wrapper {
            overflow-x: auto;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--white);
        }

        table th,
        table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        table th {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: var(--white);
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        table tr:hover {
            background-color: #f8fafc;
        }

        table tr:last-child td {
            border-bottom: none;
        }

        /* Footer */
        footer {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: var(--white);
            padding: 2rem 0;
            text-align: center;
        }

        footer p {
            opacity: 0.9;
            font-size: 0.9rem;
        }

        /* Utility Classes */
        .text-center { text-align: center; }
        .text-muted { color: var(--text-muted); }
        .mt-1 { margin-top: 0.5rem; }
        .mt-2 { margin-top: 1rem; }
        .mt-3 { margin-top: 1.5rem; }
        .mt-4 { margin-top: 2rem; }
        .mb-1 { margin-bottom: 0.5rem; }
        .mb-2 { margin-bottom: 1rem; }
        .mb-3 { margin-bottom: 1.5rem; }
        .mb-4 { margin-bottom: 2rem; }
        .gap-1 { gap: 0.5rem; }
        .gap-2 { gap: 1rem; }

        /* Grid System */
        .grid {
            display: grid;
            gap: 1.5rem;
        }

        .grid-2 {
            grid-template-columns: repeat(2, 1fr);
        }

        .grid-3 {
            grid-template-columns: repeat(3, 1fr);
        }

        .grid-4 {
            grid-template-columns: repeat(4, 1fr);
        }

        .grid-auto {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        /* Page Title */
        .page-header {
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }

        .page-subtitle {
            color: var(--text-muted);
            font-size: 1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .menu-toggle {
                display: block;
            }

            .nav-menu {
                position: fixed;
                top: 0;
                right: -100%;
                width: 80%;
                max-width: 300px;
                height: 100vh;
                background: linear-gradient(180deg, var(--primary-blue) 0%, #003366 100%);
                flex-direction: column;
                padding: 5rem 1.5rem 2rem;
                gap: 0.5rem;
                transition: right 0.3s ease;
                box-shadow: -5px 0 20px rgba(0,0,0,0.3);
                overflow-y: auto;
            }

            .nav-menu.active {
                right: 0;
            }

            .nav-menu a {
                width: 100%;
                padding: 1rem;
                font-size: 1rem;
                border-radius: var(--radius-sm);
            }

            .nav-user {
                margin-bottom: 1rem;
            }

            .contacts-dropdown-content {
                position: fixed;
                top: 70px;
                right: 10px;
                left: 10px;
                width: auto;
                max-height: 70vh;
            }

            .menu-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 998;
            }

            .menu-overlay.active {
                display: block;
            }

            .close-menu {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: var(--white);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
            }

            .logo-text small {
                display: none;
            }

            .logo-text strong {
                font-size: 1.1rem;
            }

            .logo img {
                height: 38px;
            }

            .grid-2, .grid-3, .grid-4 {
                grid-template-columns: 1fr;
            }

            .container {
                padding: 0 1rem;
            }

            main {
                padding: 1rem 0 2rem;
            }

            .page-title {
                font-size: 1.4rem;
            }

            .btn {
                padding: 0.65rem 1.25rem;
                font-size: 0.9rem;
            }

            table th, table td {
                padding: 0.75rem 0.5rem;
                font-size: 0.85rem;
            }

            .whatsapp-fixed {
                bottom: 70px;
                right: 20px;
                width: 45px;
                height: 45px;
                font-size: 1.3rem;
            }
        }

        @media (max-width: 480px) {
            .grid-auto {
                grid-template-columns: 1fr;
            }

            .card {
                padding: 1rem;
            }

            .alert {
                padding: 0.75rem 1rem;
                font-size: 0.9rem;
            }

            .whatsapp-fixed {
                bottom: 60px;
                right: 15px;
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
            }
        }
    </style>
</head>

<body>
    <div class="menu-overlay" id="menuOverlay" onclick="closeMenu()"></div>
    
    <header>
        <div class="container">
            <nav>
                <a href="<?php echo SITE_URL; ?>index.php" class="logo">
                    <img src="<?php echo SITE_URL; ?>assets/img/logo-ispotec.png" alt="ISPOTEC Online">
                    <div class="logo-text">
                        <strong>ISPOTEC</strong>
                        <small>Instituto Superior Politécnico e de Tecnologias</small>
                    </div>
                </a>

                <button class="menu-toggle" onclick="toggleMenu()" aria-label="Menu">
                    <div class="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                <ul class="nav-menu" id="navMenu">
                    <li><a href="<?php echo SITE_URL; ?>index.php">Início</a></li>
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <li><a href="<?php echo SITE_URL; ?>dashboard/">Dashboard</a></li>
                        <li><a href="<?php echo SITE_URL; ?>users/">Utilizadores</a></li>
                        
                        <!-- Botão Contactos -->
                        <li class="contacts-dropdown">
                            <button class="contacts-toggle">
                                <span class="contacts-icon">📞</span>
                                <span>Contactos</span>
                            </button>
                            <div class="contacts-dropdown-content">
                                <div class="contacts-header">
                                    <h3>📞 Contactos ISPOTEC</h3>
                                </div>
                                <div class="contacts-body">
                                    <!-- Telefones -->
                                    <div class="contact-group">
                                        <div class="group-title">
                                            <span>📞</span>
                                            <span>Telefones</span>
                                        </div>
                                        <div class="contact-items">
                                            <a href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
                                               target="_blank" class="contact-item contact-item-link">
                                                <div class="contact-icon" style="background: rgba(37, 211, 102, 0.1); color: #25D366;">💬</div>
                                                <div class="contact-details">
                                                    <div class="contact-title">WhatsApp</div>
                                                    <div class="contact-info">+258 87 072 6974</div>
                                                </div>
                                                <div class="external-icon">↗</div>
                                            </a>
                                            <a href="tel:+258840726974" class="contact-item contact-item-link">
                                                <div class="contact-icon" style="background: rgba(0, 123, 255, 0.1); color: #007bff;">📱</div>
                                                <div class="contact-details">
                                                    <div class="contact-title">Telefone</div>
                                                    <div class="contact-info">+258 84 072 6974</div>
                                                </div>
                                                <div class="external-icon">↗</div>
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <!-- Redes Sociais -->
                                    <div class="contact-group">
                                        <div class="group-title">
                                            <span>🌐</span>
                                            <span>Redes Sociais</span>
                                        </div>
                                        <div class="contact-items">
                                            <a href="https://web.facebook.com/ISPOTEC/" target="_blank" class="contact-item contact-item-link">
                                                <div class="contact-icon" style="background: rgba(24, 119, 242, 0.1); color: #1877F2;">📘</div>
                                                <div class="contact-details">
                                                    <div class="contact-title">Facebook</div>
                                                    <div class="contact-info">@ISPOTEC</div>
                                                </div>
                                                <div class="external-icon">↗</div>
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <!-- Email -->
                                    <div class="contact-group">
                                        <div class="group-title">
                                            <span>✉️</span>
                                            <span>Email</span>
                                        </div>
                                        <div class="contact-items">
                                            <a href="mailto:ifoptec.politecnica@gmail.com" class="contact-item contact-item-link">
                                                <div class="contact-icon" style="background: rgba(220, 53, 69, 0.1); color: #dc3545;">📧</div>
                                                <div class="contact-details">
                                                    <div class="contact-title">Email Institucional</div>
                                                    <div class="contact-info">ifoptec.politecnica@gmail.com</div>
                                                </div>
                                                <div class="external-icon">↗</div>
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <!-- Localização -->
                                    <div class="contact-group">
                                        <div class="group-title">
                                            <span>📍</span>
                                            <span>Localização</span>
                                        </div>
                                        <div class="contact-items">
                                            <div class="contact-item">
                                                <div class="contact-icon" style="background: rgba(108, 117, 125, 0.1); color: #6c757d;">🏢</div>
                                                <div class="contact-details">
                                                    <div class="contact-title">ISPOTEC</div>
                                                    <div class="contact-info">Rua da Mozal, 5453-Matola</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        
                        <li><a href="<?php echo SITE_URL; ?>profile/">Perfil</a></li>
                        <li class="nav-user"><?php echo htmlspecialchars($_SESSION['user_nome'] ?? 'Utilizador'); ?></li>
                        <li><a href="<?php echo SITE_URL; ?>auth/logout.php" class="nav-logout">Sair</a></li>
                    <?php else: ?>
                        <li><a href="<?php echo SITE_URL; ?>auth/login.php" class="btn btn-secondary" style="background: rgba(255,255,255,0.1);">Entrar</a></li>
                        <li><a href="<?php echo SITE_URL; ?>auth/register.php" class="btn btn-success">Registar</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>
    
    <main>
        <script>
            function toggleMenu() {
                document.getElementById('navMenu').classList.toggle('active');
                document.getElementById('menuOverlay').classList.toggle('active');
                document.body.style.overflow = document.getElementById('navMenu').classList.contains('active') ? 'hidden' : '';
            }
            
            function closeMenu() {
                document.getElementById('navMenu').classList.remove('active');
                document.getElementById('menuOverlay').classList.remove('active');
                document.body.style.overflow = '';
                
                // Fechar também o dropdown de contactos se estiver aberto
                const contactsDropdown = document.querySelector('.contacts-dropdown');
                if (contactsDropdown) {
                    contactsDropdown.classList.remove('active');
                }
            }
            
            // Controlar o dropdown de contactos
            document.addEventListener('DOMContentLoaded', function() {
                const contactsDropdown = document.querySelector('.contacts-dropdown');
                const contactsToggle = document.querySelector('.contacts-toggle');
                
                if (contactsToggle) {
                    contactsToggle.addEventListener('click', function(e) {
                        e.stopPropagation();
                        contactsDropdown.classList.toggle('active');
                    });
                    
                    // Fechar dropdown ao clicar fora
                    document.addEventListener('click', function(e) {
                        if (contactsDropdown && !contactsDropdown.contains(e.target)) {
                            contactsDropdown.classList.remove('active');
                        }
                    });
                    
                    // Fechar dropdown no mobile ao selecionar item
                    const contactLinks = document.querySelectorAll('.contact-item-link');
                    contactLinks.forEach(link => {
                        link.addEventListener('click', function() {
                            if (window.innerWidth <= 768) {
                                contactsDropdown.classList.remove('active');
                                closeMenu(); // Fechar também o menu mobile se estiver aberto
                            }
                        });
                    });
                }
                
                // Evitar fechar dropdown ao clicar dentro dele
                const contactsContent = document.querySelector('.contacts-dropdown-content');
                if (contactsContent) {
                    contactsContent.addEventListener('click', function(e) {
                        e.stopPropagation();
                    });
                }
                
                // Fechar menus ao pressionar ESC
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        closeMenu();
                        if (contactsDropdown) {
                            contactsDropdown.classList.remove('active');
                        }
                    }
                });
            });
        </script>

        <?php if (isset($_SESSION['user_id'])): ?>
            <a href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
               target="_blank" class="whatsapp-fixed" title="Contactar via WhatsApp">
                💬
            </a>
        <?php endif; ?>