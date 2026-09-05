<?php
/**
 * Meu Perfil - Interface Moderna e Responsiva
 */

$page_title = 'Meu Perfil';
// Ajuste os requires conforme a estrutura das suas pastas
require_once '../auth/check-auth.php'; 
require_once '../includes/header.php';
require_once '../classes/User.php';
require_once '../classes/Portfolio.php';

$user = new User($conn);
$portfolio = new Portfolio($conn);

$mensagem = '';
$erro = '';
$tipo_msg = ''; // 'success' ou 'danger'

// --- LÓGICA PHP (Processamento) ---

// 1. Processar Upload de Foto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'upload_foto') {
    if (!empty($_FILES['foto']['tmp_name'])) {
        $user->id = $_SESSION['user_id'];
        $resultado = $user->processarUploadFoto($_FILES['foto']);
        
        if ($resultado['sucesso']) {
            if ($user->atualizarFotoPerfil($resultado['caminho'])) {
                $mensagem = 'Foto de perfil actualizada!';
                $tipo_msg = 'success';
            } else {
                $erro = 'Erro ao guardar no banco de dados.';
            }
        } else {
            $erro = $resultado['erro'];
        }
    }
}

// 2. Processar Atualização de Dados
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'atualizar_perfil') {
    $nome = trim($_POST['nome'] ?? '');
    $curso = trim($_POST['curso'] ?? '');
    $nivel_academico = $_POST['nivel_academico'] ?? '';
    $bio = trim($_POST['bio'] ?? '');

    if (empty($nome)) {
        $erro = 'O nome é obrigatório.';
    } else {
        $user->id = $_SESSION['user_id'];
        $user->nome = $nome;
        $user->curso = $curso;
        $user->nivel_academico = $nivel_academico;
        $user->bio = $bio;
        
        if ($user->atualizar()) {
            $_SESSION['user_nome'] = $nome;
            $mensagem = 'Dados actualizados com sucesso!';
            $tipo_msg = 'success';
        } else {
            $erro = 'Erro ao atualizar dados.';
        }
    }
}

// Obter dados atualizados
$user_data = $user->obterPorId($_SESSION['user_id']);

// Obter Portfólio
$result_portfolio = $portfolio->listarPorUtilizador($_SESSION['user_id']);
?>

<style>
    :root {
        --primary: #4361ee;
        --primary-dark: #3a0ca3;
        --secondary: #f72585;
        --bg-body: #f8f9fa;
        --surface: #ffffff;
        --text-main: #2b2d42;
        --text-light: #8d99ae;
        --border: #e9ecef;
        --radius: 12px;
        --shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    body {
        background-color: var(--bg-body);
        color: var(--text-main);
        font-family: 'Segoe UI', system-ui, sans-serif;
    }

    .profile-container {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    /* Grid Responsivo: Muda layout automaticamente no celular */
    .profile-grid {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 2rem;
        align-items: start;
    }

    @media (max-width: 900px) {
        .profile-grid {
            grid-template-columns: 1fr; /* Empilha no celular/tablet */
        }
    }

    /* Cards (Cartões) */
    .card {
        background: var(--surface);
        border-radius: var(--radius);
        padding: 2rem;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
    }

    /* Área da Foto de Perfil */
    .profile-header {
        text-align: center;
        position: relative;
    }

    .avatar-wrapper {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto 1.5rem;
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid var(--surface);
        box-shadow: 0 5px 15px rgba(67, 97, 238, 0.2);
        cursor: zoom-in; /* Indica que pode clicar */
        transition: transform 0.3s ease;
    }

    .avatar-img:hover {
        transform: scale(1.02);
    }

    /* Botão da Câmera */
    .btn-camera {
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: var(--primary);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 3px solid var(--surface);
        transition: background 0.3s;
    }

    .btn-camera:hover {
        background: var(--primary-dark);
    }

    /* Inputs e Formulários */
    .form-group {
        margin-bottom: 1.25rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--text-main);
        font-size: 0.9rem;
    }

    input[type="text"],
    input[type="email"],
    select,
    textarea {
        width: 100%;
        padding: 0.8rem 1rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 1rem;
        background-color: #fcfcfc;
        transition: border-color 0.2s;
        box-sizing: border-box; /* Importante para responsividade */
    }

    input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: var(--primary);
        background-color: #fff;
    }

    /* Botões */
    .btn {
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
        display: inline-block;
        text-decoration: none;
        text-align: center;
    }

    .btn-primary { background: var(--primary); color: white; width: 100%; }
    .btn-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
    
    /* Portfólio Item */
    .portfolio-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 0.8rem;
        border: 1px solid transparent;
        transition: all 0.2s;
    }
    
    .portfolio-item:hover {
        background: white;
        border-color: var(--primary);
        transform: translateX(5px);
    }

    /* Modal de Visualização da Foto */
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    }

    .modal-content {
        max-width: 90%;
        max-height: 90%;
    }

    .modal-content img {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .close-modal {
        position: absolute;
        top: 20px;
        right: 30px;
        color: white;
        font-size: 2rem;
        cursor: pointer;
    }

    /* Alertas */
    .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
</style>

<div class="profile-container">
    
    <?php if ($mensagem): ?>
        <div class="alert alert-success"><?php echo $mensagem; ?></div>
    <?php endif; ?>
    <?php if ($erro): ?>
        <div class="alert alert-error"><?php echo $erro; ?></div>
    <?php endif; ?>

    <div class="profile-grid">
        
        <div class="card profile-card">
            <div class="profile-header">
                <div class="avatar-wrapper">
                    <?php 
                        $foto_url = (!empty($user_data['foto_perfil']) && file_exists('../' . $user_data['foto_perfil'])) 
                            ? '../' . htmlspecialchars($user_data['foto_perfil']) 
                            : 'https://ui-avatars.com/api/?name='.urlencode($user_data['nome']).'&background=4361ee&color=fff&size=256';
                    ?>
                    
                    <img src="<?php echo $foto_url; ?>" alt="Perfil" class="avatar-img" onclick="abrirFoto('<?php echo $foto_url; ?>')">
                    
                    <form method="POST" enctype="multipart/form-data" id="form-foto">
                        <input type="hidden" name="action" value="upload_foto">
                        <input type="file" id="input-foto" name="foto" accept="image/*" style="display: none;" onchange="this.form.submit()">
                        <label for="input-foto" class="btn-camera" title="Alterar foto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </label>
                    </form>
                </div>

                <h2 style="margin: 0; font-size: 1.5rem; color: var(--primary-dark);"><?php echo htmlspecialchars($user_data['nome']); ?></h2>
                <p style="color: var(--text-light); margin-top: 5px;"><?php echo htmlspecialchars($user_data['email']); ?></p>
                
                <div style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem; text-align: left;">
                    <p><strong>Tipo:</strong> <span style="float: right;"><?php echo ucfirst($user_data['tipo']); ?></span></p>
                    <p><strong>Membro desde:</strong> <span style="float: right;"><?php echo date('d/m/Y', strtotime($user_data['data_registo'])); ?></span></p>
                </div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2rem;">
            
            <div class="card">
                <h3 style="margin-top: 0; color: var(--primary); border-bottom: 2px solid var(--bg-body); padding-bottom: 10px; margin-bottom: 1.5rem;">Editar Informações</h3>
                
                <form method="POST">
                    <input type="hidden" name="action" value="atualizar_perfil">
                    
                    <div class="form-group">
                        <label for="nome">Nome Completo</label>
                        <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($user_data['nome']); ?>" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="curso">Curso / Área</label>
                            <input type="text" id="curso" name="curso" value="<?php echo htmlspecialchars($user_data['curso'] ?? ''); ?>" placeholder="Ex: Engenharia Informática">
                        </div>
                        <div class="form-group">
                            <label for="nivel_academico">Nível Académico</label>
                            <select id="nivel_academico" name="nivel_academico">
                                <option value="">Seleccione...</option>
                                <?php 
                                $niveis = ['Licenciatura', 'Mestrado', 'Doutoramento', 'Técnico', 'Bacharelato'];
                                foreach ($niveis as $nivel):
                                    $selected = ($user_data['nivel_academico'] == strtolower($nivel)) ? 'selected' : '';
                                ?>
                                    <option value="<?php echo strtolower($nivel); ?>" <?php echo $selected; ?>><?php echo $nivel; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="bio">Biografia Curta</label>
                        <textarea id="bio" name="bio" rows="3" placeholder="Fale um pouco sobre seus objetivos..."><?php echo htmlspecialchars($user_data['bio'] ?? ''); ?></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </form>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: var(--primary);">Meu Portfólio</h3>
                    <a href="portfolio-add.php" class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.9rem;">+ Adicionar</a>
                </div>

                <?php if ($result_portfolio->num_rows > 0): ?>
                    <?php while ($item = $result_portfolio->fetch_assoc()): ?>
                        <div class="portfolio-item">
                            <div>
                                <strong style="display: block; color: var(--text-main);"><?php echo htmlspecialchars($item['titulo']); ?></strong>
                                <small style="color: var(--text-light);"><?php echo htmlspecialchars($item['categoria'] ?? 'Geral'); ?></small>
                            </div>
                            <a href="<?php echo htmlspecialchars($item['ficheiro']); ?>" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: bold;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </a>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p style="color: var(--text-light); text-align: center; font-style: italic;">Nenhum item adicionado ainda.</p>
                <?php endif; ?>
            </div>

        </div>
    </div>
    
    <div style="margin-top: 2rem; text-align: center;">
        <a href="../dashboard/" style="color: var(--text-light); text-decoration: none;">&larr; Voltar ao Dashboard</a>
    </div>
</div>

<div id="modal-foto" class="modal-overlay" onclick="fecharFoto(event)">
    <span class="close-modal" onclick="fecharFoto(event)">&times;</span>
    <div class="modal-content">
        <img id="img-grande" src="" alt="Foto Grande">
    </div>
</div>

<script>
    // Função para abrir o modal
    function abrirFoto(url) {
        // Se for avatar padrão gerado por letras, não precisa abrir
        if(url.includes('ui-avatars.com')) return;

        const modal = document.getElementById('modal-foto');
        const img = document.getElementById('img-grande');
        img.src = url;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Impede scroll da página de fundo
    }

    // Função para fechar o modal
    function fecharFoto(event) {
        // Fecha se clicar no X ou no fundo escuro (não na imagem)
        if (event.target.className === 'modal-overlay' || event.target.className === 'close-modal') {
            document.getElementById('modal-foto').style.display = 'none';
            document.body.style.overflow = 'auto'; // Volta o scroll
        }
    }

    // Validação de tamanho no Front-end
    const inputFoto = document.getElementById('input-foto');
    if(inputFoto) {
        inputFoto.addEventListener('change', function() {
            if (this.files[0] && this.files[0].size > 5242880) { // 5MB
                alert('A imagem é muito grande! Tente uma imagem com menos de 5MB.');
                this.value = ''; // Reseta o input
                // Impede o envio do formulário (que está no onchange)
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        });
    }
</script>

<?php require_once '../includes/footer.php'; ?>