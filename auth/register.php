<?php
/**
 * Página de Registo - ISPOTEC.ONLINE
 */

$page_title = 'Registar';
require_once '../includes/header.php';

$erro = '';
$sucesso = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $tipo = $_POST['tipo'] ?? '';
    $curso = trim($_POST['curso'] ?? '');
    $nivel_academico = $_POST['nivel_academico'] ?? '';

    // Validações
    if (empty($nome) || empty($email) || empty($password) || empty($tipo)) {
        $erro = 'Por favor, preencha todos os campos obrigatórios';
    } elseif ($password !== $confirm_password) {
        $erro = 'As passwords não coincidem';
    } elseif (strlen($password) < 8) {
        $erro = 'A password deve ter no mínimo 8 caracteres';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erro = 'Email inválido';
    } else {
        $auth = new Auth($conn);
        $resultado = $auth->registar($nome, $email, $password, $tipo, $curso, $nivel_academico);

        if ($resultado['sucesso']) {
            $sucesso = $resultado['mensagem'];
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
    <div style="max-width: 600px; margin: 2rem auto; background: var(--white); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: var(--primary-blue); margin-bottom: 2rem;">Registar-se na ISPOTEC Online</h2>

        <?php if ($erro): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($erro); ?></div>
        <?php endif; ?>

        <?php if ($sucesso): ?>
            <div class="alert alert-success">
                <?php echo htmlspecialchars($sucesso); ?>
                <p style="margin-top: 0.5rem;">Pode <a href="login.php" style="color: #155724; font-weight: bold;">fazer login aqui</a> quando sua conta for aprovada.</p>
            </div>
        <?php else: ?>
            <!-- Form exibido apenas quando não há sucesso -->
            <form method="POST">
                <div class="form-group">
                    <label for="nome">Nome Completo:</label>
                    <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($_POST['nome'] ?? ''); ?>" required>
                </div>

                <div class="form-group">
                    <label for="email">Email Institucional:</label>
                    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" required>
                </div>

                <div class="form-group">
                    <label for="tipo">Tipo de Utilizador:</label>
                    <select id="tipo" name="tipo" required>
                        <option value="">Seleccione o tipo...</option>
                        <option value="estudante" <?php echo ($_POST['tipo'] ?? '') === 'estudante' ? 'selected' : ''; ?>>Estudante</option>
                        <option value="docente" <?php echo ($_POST['tipo'] ?? '') === 'docente' ? 'selected' : ''; ?>>Docente</option>
                        <option value="especialista" <?php echo ($_POST['tipo'] ?? '') === 'especialista' ? 'selected' : ''; ?>>Especialista</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="curso">Curso/Área:</label>
                    <input type="text" id="curso" name="curso" value="<?php echo htmlspecialchars($_POST['curso'] ?? ''); ?>">
                </div>

                <div class="form-group">
                    <label for="nivel_academico">Nível Académico:</label>
                    <select id="nivel_academico" name="nivel_academico">
                        <option value="">Seleccione o nível...</option>
                        <option value="licenciatura" <?php echo ($_POST['nivel_academico'] ?? '') === 'licenciatura' ? 'selected' : ''; ?>>Licenciatura</option>
                        <option value="mestrado" <?php echo ($_POST['nivel_academico'] ?? '') === 'mestrado' ? 'selected' : ''; ?>>Mestrado</option>
                        <option value="doutoramento" <?php echo ($_POST['nivel_academico'] ?? '') === 'doutoramento' ? 'selected' : ''; ?>>Doutoramento</option>
                        <option value="tecnico" <?php echo ($_POST['nivel_academico'] ?? '') === 'tecnico' ? 'selected' : ''; ?>>Técnico</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required 
                           title="Mínimo 8 caracteres">
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirmar Password:</label>
                    <input type="password" id="confirm_password" name="confirm_password" required>
                </div>

                <button type="submit" class="btn btn-success" style="width: 100%; padding: 1rem; font-weight: bold;">Registar</button>
            </form>

            <p style="text-align: center; margin-top: 1.5rem;">
                Já tem conta? <a href="login.php" style="color: var(--secondary-blue); text-decoration: none; font-weight: bold;">Entrar aqui</a>
            </p>
        <?php endif; ?>
    </div>
</div>

<?php
require_once '../includes/footer.php';
?>
