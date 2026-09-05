<?php
/**
 * Página de Login - ISPOTEC.ONLINE
 */

$page_title = 'Entrar';
require_once '../includes/header.php';

$erro = '';
$sucesso = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $erro = 'Por favor, preencha todos os campos';
    } else {
        $auth = new Auth($conn);
        $resultado = $auth->login($email, $password);

        if ($resultado['sucesso']) {
            $sucesso = $resultado['mensagem'];
            echo '<script>setTimeout(() => window.location.href = "../dashboard/", 2000);</script>';
        } else {
            $erro = $resultado['mensagem'];
        }
    }
}
?>
<div style="text-align: center; margin: 2rem 0;">
    <img 
        src="../assets/img/logo-ispotec.png" 
        alt="ISPOTEC Online"
        style="max-height: 120px;"
    >
</div>
<div class="container">
    <div style="max-width: 500px; margin: 3rem auto; background: var(--white); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: var(--primary-blue); margin-bottom: 2rem;">Entrar na Plataforma</h2>

        <?php if ($erro): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($erro); ?></div>
        <?php endif; ?>

        <?php if ($sucesso): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($sucesso); ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label for="email">Email Institucional:</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-weight: bold;">Entrar</button>
        </form>

        <p style="text-align: center; margin-top: 1.5rem;">
            Não tem conta? <a href="register.php" style="color: var(--secondary-blue); text-decoration: none; font-weight: bold;">Registar aqui</a>
        </p>
    </div>
</div>

<?php
require_once '../includes/footer.php';
?>
