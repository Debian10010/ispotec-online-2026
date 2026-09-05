<?php
/**
 * Gestão de Utilizadores Pendentes - Admin
 */

$page_title = 'Utilizadores Pendentes';
require_once '../auth/check-admin.php';
require_once '../includes/header.php';
require_once '../classes/User.php';

$user = new User($conn);

$mensagem = '';

// Processar aprovação/rejeição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = intval($_POST['user_id'] ?? 0);
    $acao = $_POST['acao'] ?? '';

    if ($user_id > 0 && in_array($acao, ['aprovado', 'bloqueado'])) {
        $user->atualizarStatus($user_id, $acao);
        $mensagem = 'Utilizador ' . ($acao === 'aprovado' ? 'aprovado' : 'rejeitado') . ' com sucesso!';
    }
}

// Obter utilizadores pendentes
$result = $user->listarPendentes();
$pendentes = [];
while ($row = $result->fetch_assoc()) {
    $pendentes[] = $row;
}

?>

<div class="container">
    <h1 style="margin-top: 2rem; margin-bottom: 1rem;">Utilizadores Pendentes de Aprovação</h1>
    <p style="color: #666; margin-bottom: 2rem;">Total: <strong><?php echo count($pendentes); ?></strong> utilizadores</p>

    <?php if (!empty($mensagem)): ?>
        <div class="alert alert-success"><?php echo $mensagem; ?></div>
    <?php endif; ?>

    <?php if (empty($pendentes)): ?>
        <div class="alert alert-info">Não há utilizadores pendentes de aprovação.</div>
    <?php else: ?>
        <div style="background: var(--white); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: var(--primary-blue); color: var(--white);">
                    <tr>
                        <th style="padding: 1rem; text-align: left;">Nome</th>
                        <th style="padding: 1rem; text-align: left;">Email</th>
                        <th style="padding: 1rem; text-align: left;">Tipo</th>
                        <th style="padding: 1rem; text-align: left;">Curso</th>
                        <th style="padding: 1rem; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($pendentes as $p): ?>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 1rem;"><?php echo htmlspecialchars($p['nome']); ?></td>
                            <td style="padding: 1rem;"><?php echo htmlspecialchars($p['email']); ?></td>
                            <td style="padding: 1rem;"><strong><?php echo ucfirst($p['tipo']); ?></strong></td>
                            <td style="padding: 1rem;"><?php echo htmlspecialchars($p['curso'] ?? '-'); ?></td>
                            <td style="padding: 1rem; text-align: center;">
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="user_id" value="<?php echo $p['id']; ?>">
                                    <input type="hidden" name="acao" value="aprovado">
                                    <button type="submit" class="btn btn-success" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Aprovar</button>
                                </form>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="user_id" value="<?php echo $p['id']; ?>">
                                    <input type="hidden" name="acao" value="bloqueado">
                                    <button type="submit" class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="return confirm('Rejeitar?');">Rejeitar</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>

    <div style="margin-top: 2rem;">
        <a href="index.php" class="btn btn-primary">Voltar ao Dashboard</a>
    </div>
</div>

<?php
require_once '../includes/footer.php';
?>
