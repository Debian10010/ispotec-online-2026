<?php
/**
 * Rodapé da Plataforma - Design moderno e responsivo
 */
?>
    </main>
    
    <!-- Footer de Contactos (já existente no cabeçalho) -->
    
    <!-- Footer Principal -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-grid">
                    <div class="footer-column">
                        <div class="footer-brand">
                            <strong>ISPOTEC Online</strong>
                            <p class="footer-desc">Rede Social Académica do Instituto Superior Politécnico e de Tecnologias</p>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-title">Contactos Rápidos</h4>
                        <div class="footer-links">
                            <a href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
                               target="_blank" class="footer-contact-link">
                                <span class="footer-icon">💬</span>
                                <span>WhatsApp: +258 87 072 6974</span>
                            </a>
                            <a href="tel:+258840726974" class="footer-contact-link">
                                <span class="footer-icon">📱</span>
                                <span>Telefone: +258 84 072 6974</span>
                            </a>
                            <a href="mailto:ifoptec.politecnica@gmail.com" class="footer-contact-link">
                                <span class="footer-icon">✉️</span>
                                <span>Email</span>
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-title">Plataformas</h4>
                        <div class="footer-links">
                            <a href="https://sisga.ispotec.ac.mz/" target="_blank">
                                <span class="footer-icon">📊</span>
                                <span>SISGA</span>
                            </a>
                            <a href="https://classroom.google.com/" target="_blank">
                                <span class="footer-icon">🏫</span>
                                <span>Google Classroom</span>
                            </a>
                            <a href="https://ispotec.moodlecloud.com/login/index.php" target="_blank">
                                <span class="footer-icon">🎯</span>
                                <span>Moodle</span>
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-title">Unidades ISPOTEC</h4>
                        <div class="footer-links">
                            <a href="https://ispotec.ac.mz/ISPOTEC" target="_blank">
                                <span class="footer-icon">🏛️</span>
                                <span>ISPOTEC</span>
                            </a>
                            <a href="https://ispotec.ac.mz/Ceap" target="_blank">
                                <span class="footer-icon">🎨</span>
                                <span>CEAP</span>
                            </a>
                            <a href="https://ispotec.ac.mz/Cmu" target="_blank">
                                <span class="footer-icon">🎵</span>
                                <span>CMU</span>
                            </a>
                            <a href="https://ispotec.ac.mz/Crc" target="_blank">
                                <span class="footer-icon">⚖️</span>
                                <span>CRC</span>
                            </a>
                            <a href="https://ispotec.ac.mz/Ctodh" target="_blank">
                                <span class="footer-icon">🌍</span>
                                <span>CTODH</span>
                            </a>
                            <a href="https://ispotec.ac.mz/" target="_blank">
                                <span class="footer-icon">🌐</span>
                                <span>Site Principal</span>
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-title">Bibliotecas Digitais</h4>
                        <div class="footer-links">
                            <a href="https://files.fm/u/5ba9773fmx" target="_blank">
                                <span class="footer-icon">📓</span>
                                <span>Ensino Médio</span>
                            </a>
                            <a href="https://files.fm/u/3kdkcxhqjs" target="_blank">
                                <span class="footer-icon">📕</span>
                                <span>Ensino Superior</span>
                            </a>
                            <a href="https://ispotec.sgeapp.com" target="_blank">
                                <span class="footer-icon">📱</span>
                                <span>SGE App</span>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-bottom-left">
                        <p>&copy; <?php echo date('Y'); ?> ISPOTEC Online. Todos os direitos reservados.</p>
                        <div class="footer-location">
                            <span class="location-icon">📍</span>
                            <span>Rua da Mozal, 5453-Matola</span>
                        </div>
                    </div>
                    
                    <div class="footer-bottom-right">
                        <div class="footer-social">
                            <a href="https://web.facebook.com/ISPOTEC/" target="_blank" class="social-link" title="Facebook">
                                <span class="social-icon">📘</span>
                                <span class="social-text">Facebook</span>
                            </a>
                            <a href="mailto:ifoptec.politecnica@gmail.com" class="social-link" title="Email">
                                <span class="social-icon">✉️</span>
                                <span class="social-text">Email</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- Botão WhatsApp Fixo -->
    <?php if (isset($_SESSION['user_id'])): ?>
        <a href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
           target="_blank" class="whatsapp-fixed" title="Contactar via WhatsApp">
            💬
        </a>
    <?php endif; ?>

    <style>
        /* Footer Principal */
        footer {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: var(--white);
            padding: 2.5rem 0 2rem;
        }

        .footer-content {
            width: 100%;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 2rem;
            margin-bottom: 2.5rem;
        }

        .footer-column {
            display: flex;
            flex-direction: column;
        }

        .footer-brand {
            margin-bottom: 1rem;
        }

        .footer-brand strong {
            font-size: 1.25rem;
            display: block;
            margin-bottom: 0.5rem;
            color: var(--white);
        }

        .footer-desc {
            font-size: 0.85rem;
            opacity: 0.9;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.8);
        }

        .footer-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--white);
            padding-bottom: 0.5rem;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .footer-links {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .footer-links a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-radius: var(--radius-sm);
        }

        .footer-links a:hover {
            color: var(--white);
            transform: translateX(5px);
            background: rgba(255, 255, 255, 0.05);
            padding-left: 0.75rem;
            padding-right: 0.75rem;
        }

        .footer-contact-link:hover {
            color: #25D366 !important;
        }

        .footer-icon {
            font-size: 1.1rem;
            width: 24px;
            text-align: center;
            flex-shrink: 0;
        }

        .footer-bottom {
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
        }

        .footer-bottom-left {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            flex: 1;
        }

        .footer-bottom-left p {
            font-size: 0.85rem;
            opacity: 0.9;
            color: rgba(255, 255, 255, 0.8);
            margin: 0;
        }

        .footer-location {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            opacity: 0.8;
            padding: 0.5rem 0;
        }

        .location-icon {
            font-size: 0.9rem;
        }

        .footer-bottom-right {
            flex-shrink: 0;
        }

        .footer-social {
            display: flex;
            gap: 1rem;
        }

        .social-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-sm);
            text-decoration: none;
            transition: all 0.3s;
            color: var(--white);
        }

        .social-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .social-link:hover .social-icon {
            transform: scale(1.2);
        }

        .social-link[title="Facebook"]:hover {
            background: #1877F2;
        }

        .social-link[title="Email"]:hover {
            background: #EA4335;
        }

        .social-icon {
            font-size: 1.1rem;
            transition: transform 0.3s;
        }

        .social-text {
            font-size: 0.85rem;
            font-weight: 500;
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

        /* Responsivo */
        @media (max-width: 1024px) {
            .footer-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
            }
        }

        @media (max-width: 768px) {
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .footer-column {
                padding-bottom: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .footer-column:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .footer-bottom {
                flex-direction: column;
                text-align: center;
                gap: 1.5rem;
                padding-top: 1.5rem;
            }

            .footer-bottom-left {
                align-items: center;
            }

            .footer-social {
                justify-content: center;
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
            footer {
                padding: 2rem 0 1.5rem;
            }

            .footer-grid {
                gap: 1.5rem;
            }

            .footer-links {
                gap: 0.5rem;
            }

            .footer-links a {
                font-size: 0.85rem;
                padding: 0.4rem 0;
            }

            .footer-icon {
                font-size: 1rem;
                width: 20px;
            }

            .footer-bottom {
                gap: 1rem;
            }

            .footer-social {
                flex-direction: column;
                width: 100%;
            }

            .social-link {
                justify-content: center;
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

    <script>
        // Script para animações do footer
        document.addEventListener('DOMContentLoaded', function() {
            // Botão WhatsApp fixo
            const whatsappBtn = document.querySelector('.whatsapp-fixed');
            
            if (whatsappBtn) {
                // Adicionar efeito de pulso periódico
                setInterval(() => {
                    whatsappBtn.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        whatsappBtn.style.transform = 'scale(1)';
                    }, 500);
                }, 5000);
                
                // Animar ao passar o mouse
                whatsappBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1)';
                    this.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.4)';
                });
                
                whatsappBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
                });
            }
            
            // Animações suaves para links do footer
            const footerLinks = document.querySelectorAll('.footer-links a');
            footerLinks.forEach(link => {
                link.addEventListener('mouseenter', function() {
                    const icon = this.querySelector('.footer-icon');
                    if (icon) {
                        icon.style.transform = 'scale(1.2)';
                        icon.style.transition = 'transform 0.3s';
                    }
                });
                
                link.addEventListener('mouseleave', function() {
                    const icon = this.querySelector('.footer-icon');
                    if (icon) {
                        icon.style.transform = 'scale(1)';
                    }
                });
            });
            
            // Animações para ícones sociais
            const socialIcons = document.querySelectorAll('.social-icon');
            socialIcons.forEach(icon => {
                icon.addEventListener('mouseenter', function() {
                    this.style.transform = 'rotate(10deg) scale(1.1)';
                });
                
                icon.addEventListener('mouseleave', function() {
                    this.style.transform = 'rotate(0) scale(1)';
                });
            });
            
            // Efeito de carregamento suave para as colunas
            const footerColumns = document.querySelectorAll('.footer-column');
            footerColumns.forEach((column, index) => {
                column.style.opacity = '0';
                column.style.transform = 'translateY(20px)';
                column.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    column.style.opacity = '1';
                    column.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        });
    </script>
</body>
</html>