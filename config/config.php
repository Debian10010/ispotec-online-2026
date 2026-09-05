<?php
/**
 * Configurações Gerais da Plataforma
 */

// URLs e Caminhos
define('SITE_URL', 'http://localhost/ispotec.online/');
define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
define('INCLUDES_PATH', ROOT_PATH . 'includes/');
define('CLASSES_PATH', ROOT_PATH . 'classes/');
define('UPLOADS_PATH', ROOT_PATH . 'uploads/');


// Configurações de Sessão
define('SESSION_TIMEOUT', 3600); // 1 hora
define('SESSION_NAME', 'ispotec_session');

// Configurações de Segurança
define('HASH_ALGO', PASSWORD_BCRYPT);
define('HASH_OPTIONS', ['cost' => 12]);

// Mensagens do Sistema
define('APP_NAME', 'ISPOTEC Online');
define('APP_VERSION', '1.0.0');

// Configuração de uploads
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi']);

// Paginação
define('ITEMS_PER_PAGE', 15);

define('GROQ_API_KEY', 'gsk_...');


require_once CLASSES_PATH . 'Database.php';

?>
