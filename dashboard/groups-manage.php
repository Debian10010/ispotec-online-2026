<?php
/**
 * Gestão de Grupos/Disciplinas - Admin
 */

$page_title = 'Gerir Disciplinas';
require_once '../auth/check-admin.php';
require_once '../includes/header.php';
require_once '../classes/Group.php';

$conn = $database->connect(); // Assuming $database is defined in header.php
$group = new Group($conn);

$mensagem = '';
$erro = '';

// Processar criação de grupo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'criar') {
    $nome = trim($_POST['nome'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');
    $disciplina = trim($_POST['disciplina'] ?? '');
    $modulo = trim($_POST['modulo'] ?? '');

    if (empty($nome) || empty($disciplina)) {
        $erro = 'Nome e Disciplina são obrigatórios';
    } else {
        $group->nome = $nome;
        $group->descricao = $descricao;
        $group->disciplina = $disciplina;
        $group->modulo = $modulo;
        $group->criado_por = $_SESSION['user_id'];

        if ($group->criar()) {
            $mensagem = 'Grupo criado com sucesso!';
        } else {
            $erro = 'Erro ao criar grupo';
        }
    }
}

// Eliminar grupo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'eliminar') {
    $group_id = intval($_POST['group_id'] ?? 0);
    if ($group_id > 0 && $group->eliminar($group_id)) {
        $mensagem = 'Grupo eliminado com sucesso!';
    }
}

// Listar todos os grupos
$result = $group->listarTodos();
$grupos = [];
while ($row = $result->fetch_assoc()) {
    $grupos[] = $row;
}

$database->closeConnection();
?>

<div class="container">
    <h1 style="margin-top: 2rem; margin-bottom: 2rem;">Gestão de Disciplinas e Grupos</h1>

    <?php if ($mensagem): ?>
        <div class="alert alert-success"><?php echo $mensagem; ?></div>
    <?php endif; ?>

    <?php if ($erro): ?>
        <div class="alert alert-error"><?php echo $erro; ?></div>
    <?php endif; ?>

    <!-- Formulário de Criação -->
    <div style="background: var(--white); padding: 2rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h3 style="color: var(--primary-blue); margin-bottom: 1.5rem;">Criar Nova Disciplina/Grupo</h3>
        
        <form method="POST">
            <input type="hidden" name="action" value="criar">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="form-group">
                    <label for="nome">Nome da Disciplina:</label>
                    <input type="text" id="nome" name="nome" required>
                </div>

                <div class="form-group">
                    <label for="disciplina">Disciplina:</label>
                    <input type="text" id="disciplina" name="disciplina" required>
                </div>
            </div>

            <div class="form-group">
                <label for="descricao">Descrição:</label>
                <textarea id="descricao" name="descricao" rows="3"></textarea>
            </div>

            <div class="form-group">
                <label for="modulo">Módulo:</label>
                <input type="text" id="modulo" name="modulo">
            </div>

            <button type="submit" class="btn btn-success" style="padding: 0.8rem 2rem;">Criar Grupo</button>
        </form>
    </div>

    <!-- Lista de Grupos -->
    <div style="background: var(--white); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: var(--primary-blue); color: var(--white);">
                <tr>
                    <th style="padding: 1rem; text-align: left;">Disciplina</th>
                    <th style="padding: 1rem; text-align: left;">Descrição</th>
                    <th style="padding: 1rem; text-align: center;">Membros</th>
                    <th style="padding: 1rem; text-align: center;">Posts</th>
                    <th style="padding: 1rem; text-align: left;">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($grupos)): ?>
                    <tr>
                        <td colspan="5" style="padding: 2rem; text-align: center; color: #666;">Nenhum grupo criado ainda</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($grupos as $g): ?>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 1rem;">
                                <strong><?php echo htmlspecialchars($g['nome']); ?></strong><br>
                                <small style="color: #666;">Módulo: <?php echo htmlspecialchars($g['modulo'] ?? '-'); ?></small>
                            </td>
                            <td style="padding: 1rem;"><?php echo htmlspecialchars(substr($g['descricao'] ?? '', 0, 50)) . (strlen($g['descricao'] ?? '') > 50 ? '...' : ''); ?></td>
                            <td style="padding: 1rem; text-align: center;">
                                <span style="background-color: var(--secondary-blue); color: var(--white); padding: 0.25rem 0.75rem; border-radius: 20px;"><?php echo $g['total_membros']; ?></span>
                            </td>
                            <td style="padding: 1rem; text-align: center;">
                                <span style="background-color: var(--accent-green); color: var(--white); padding: 0.25rem 0.75rem; border-radius: 20px;"><?php echo $g['total_posts']; ?></span>
                            </td>
                            <td style="padding: 1rem;">
                                <a href="group-details.php?id=<?php echo $g['id']; ?>" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Ver</a>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="eliminar">
                                    <input type="hidden" name="group_id" value="<?php echo $g['id']; ?>">
                                    <button type="submit" class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem; background-color: #f44336; color: var(--white);" onclick="return confirm('Tem certeza?');">Eliminar</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 2rem;">
        <a href="index.php" class="btn btn-primary">Voltar ao Dashboard</a>
    </div>
</div>

<?php
require_once '../includes/footer.php';
?>
