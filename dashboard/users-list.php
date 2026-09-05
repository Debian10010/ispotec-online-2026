<?php
/**
 * Lista de Utilizadores Aprovados - Admin
 */

$page_title = 'Lista de Utilizadores';
require_once '../auth/check-admin.php';
require_once '../includes/header.php';


// Filtros
$filtro_tipo = $_GET['tipo'] ?? '';
$filtro_status = $_GET['status'] ?? 'aprovado';

$query = "SELECT id, nome, email, tipo, curso, status, data_registo FROM users";
$conditions = [];
$params = [];
$types = '';

if (!empty($filtro_tipo)) {
    $conditions[] = "tipo = ?";
    $params[] = $filtro_tipo;
    $types .= 's';
}

if (!empty($filtro_status)) {
    $conditions[] = "status = ?";
    $params[] = $filtro_status;
    $types .= 's';
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$query .= " ORDER BY data_registo DESC LIMIT 100";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
$utilizadores = [];
while ($row = $result->fetch_assoc()) {
    $utilizadores[] = $row;
}

?>

<div class="container">
    <h1 style="margin-top: 2rem; margin-bottom: 1rem;">Utilizadores Registados</h1>

    <div style="background: var(--white); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h3 style="color: var(--primary-blue); margin-bottom: 1rem;">Filtros</h3>
        <form method="GET" style="display: flex; gap: 1rem;">
            <select name="tipo" style="padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 5px;">
                <option value="">Todos os tipos</option>
                <option value="estudante" <?php echo $filtro_tipo === 'estudante' ? 'selected' : ''; ?>>Estudante</option>
                <option value="docente" <?php echo $filtro_tipo === 'docente' ? 'selected' : ''; ?>>Docente</option>
                <option value="especialista" <?php echo $filtro_tipo === 'especialista' ? 'selected' : ''; ?>>Especialista</option>
            </select>
            <button type="submit" class="btn btn-primary">Filtrar</button>
        </form>
    </div>

    <div style="background: var(--white); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: var(--primary-blue); color: var(--white);">
                <tr>
                    <th style="padding: 1rem; text-align: left;">Nome</th>
                    <th style="padding: 1rem; text-align: left;">Email</th>
                    <th style="padding: 1rem; text-align: left;">Tipo</th>
                    <th style="padding: 1rem; text-align: left;">Curso</th>
                    <th style="padding: 1rem; text-align: left;">Status</th>
                    <th style="padding: 1rem; text-align: left;">Data Registo</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($utilizadores as $u): ?>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 1rem;"><?php echo htmlspecialchars($u['nome']); ?></td>
                        <td style="padding: 1rem;"><?php echo htmlspecialchars($u['email']); ?></td>
                        <td style="padding: 1rem;"><strong><?php echo ucfirst($u['tipo']); ?></strong></td>
                        <td style="padding: 1rem;"><?php echo htmlspecialchars($u['curso'] ?? '-'); ?></td>
                        <td style="padding: 1rem;">
                            <span style="padding: 0.3rem 0.8rem; border-radius: 3px; font-size: 0.9rem; background-color: <?php echo $u['status'] === 'aprovado' ? '#d4edda' : '#f8d7da'; ?>; color: <?php echo $u['status'] === 'aprovado' ? '#155724' : '#721c24'; ?>;">
                                <?php echo ucfirst($u['status']); ?>
                            </span>
                        </td>
                        <td style="padding: 1rem; font-size: 0.9rem;"><?php echo date('d/m/Y', strtotime($u['data_registo'])); ?></td>
                    </tr>
                <?php endforeach; ?>
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
