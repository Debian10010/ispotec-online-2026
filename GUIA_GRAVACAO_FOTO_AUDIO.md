# Guia de Gravação de Áudio e Captura de Foto - ISPOTEC.ONLINE

## Funcionalidades Adicionadas

O sistema de chat (global e de grupo) agora suporta captura em tempo real de:
- 📷 Fotos (via webcam)
- 🎙️ Áudio (via microfone)
- 📎 Ficheiros tradicionais (já existente)

## Como Usar

### Capturar Foto

1. Abra o chat (global ou de grupo)
2. Clique no botão **📷** (verde)
3. Na modal que abrir:
   - Clique **"Iniciar"** para ativar a câmera
   - Clique **"Capturar"** para tirar a foto
   - Veja a prévia da foto
   - Clique **"Retomar"** para tirar outra ou **"Enviar"** para usar esta
4. A foto aparecerá no preview do formulário
5. Digite uma mensagem (opcional) e clique **"Enviar"**

### Gravar Áudio

1. Abra o chat (global ou de grupo)
2. Clique no botão **🎙️** (vermelho)
3. Na modal que abrir:
   - Clique **"Gravar"** para começar a gravação
   - O contador mostra tempo decorrido (MM:SS)
   - Clique **"Parar"** quando terminar
   - Clique **"Ouvir"** para reproduzir a gravação
   - Clique **"Retomar"** para gravar novamente ou **"Enviar"** para usar este
4. O áudio aparecerá no preview do formulário
5. Digite uma mensagem (opcional) e clique **"Enviar"**

### Upload de Ficheiro Tradicional

1. Clique no botão **📎** (azul)
2. Selecione qualquer ficheiro do seu computador
3. O nome aparecerá no preview
4. Digite uma mensagem (opcional) e clique **"Enviar"**

## Requisitos do Navegador

- **Câmera**: Necessário navegador com suporte a `getUserMedia()` API
- **Microfone**: Necessário navegador com suporte a `MediaRecorder` API
- **Permissões**: Browser pedirá permissão para acessar câmera e microfone

Navegadores suportados:
- Chrome 53+
- Firefox 55+
- Safari 14.1+
- Edge 79+
- Opera 40+

## Recursos Técnicos

- Fotos capturadas são convertidas para JPEG
- Áudios gravados são convertidos para MP3
- Máximo de ficheiros: 10 MB para imagens, 50 MB para áudio e vídeo
- Os ficheiros são processados localmente no navegador antes do upload
- Todos os ficheiros são armazenados em pastas organizadas (`uploads/chat/`)

## Privacidade e Segurança

- As gravações de áudio/foto são processadas apenas no seu navegador
- Nada é enviado para servidores até você clicar **"Enviar"**
- Pode descartar qualquer captura clicando **"Sair"** na modal
- O botão **"✕"** no preview permite remover o ficheiro antes de enviar

## Resolução de Problemas

**"Erro ao acessar câmera"**
- Verifique se deu permissão ao browser
- Reinicie o browser
- Confirme que nenhum outro app está usando a câmera

**"Erro ao acessar microfone"**
- Verifique se o microfone está ligado
- Confirme que o navegador tem permissão
- Teste o microfone em outro app

**Ficheiro muito grande**
- Reduza a resolução da câmera ou qualidade do áudio
- Comprima ficheiros antes de enviar
- Máximo 50 MB por ficheiro

## Integração com Chat

Todas as capturas são integradas automaticamente com o sistema de chat existente:
- Aparecem no histórico de mensagens
- São visualizadas inline (fotos e vídeos)
- Áudios têm player integrado
- Documentos têm botão de download
