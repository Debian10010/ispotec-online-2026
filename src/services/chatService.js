import { api } from './api';

const DEFAULT_WELCOME_MESSAGES = [
  {
    id: 'welcome-1',
    user_id: 'sys-admin',
    user_nome: 'Secretaria Académica ISPOTEC',
    user_tipo: 'especialista',
    conteudo: '👋 Bem-vindos ao Chat Geral ISPOTEC! Este é o espaço de comunicação de toda a comunidade académica. Todos os estudantes, docentes e especialistas registados podem partilhar informações e colaborar aqui.',
    tipo_mensagem: 'texto',
    data_criacao: new Date(Date.now() - 3600000 * 2).toISOString().replace('T', ' ').substring(0, 19)
  },
  {
    id: 'welcome-2',
    user_id: 'sys-coord',
    user_nome: 'Coordenação Pedagógica',
    user_tipo: 'docente',
    conteudo: '📚 Sejam bem-vindos ao novo ano letivo! Usem este canal para tirar dúvidas gerais, divulgar eventos e partilhar materiais de interesse comum.',
    tipo_mensagem: 'texto',
    data_criacao: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19)
  }
];

export const chatService = {
  async getGlobalMessages() {
    try {
      const res = await api.get('/chat/global');
      if (res && res.dados && Array.isArray(res.dados) && res.dados.length > 0) {
        // Cache to local storage
        localStorage.setItem('ispotec_global_chat_messages', JSON.stringify(res.dados));
        return res.dados;
      }
      // If empty backend, check localStorage or return defaults
      const local = localStorage.getItem('ispotec_global_chat_messages');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (_) {}
      }
      return DEFAULT_WELCOME_MESSAGES;
    } catch (error) {
      console.warn('[chatService.getGlobalMessages API unreachable, using local storage]', error.message);
      const local = localStorage.getItem('ispotec_global_chat_messages');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (_) {}
      }
      return DEFAULT_WELCOME_MESSAGES;
    }
  },

  async sendGlobalMessage({ conteudo, tipo_mensagem = 'texto', ficheiro_path = null, ficheiro_nome = null, ficheiro_tamanho = null, user = null }) {
    try {
      const res = await api.post('/chat/global', {
        conteudo,
        tipo_mensagem,
        ficheiro_path,
        ficheiro_nome,
        ficheiro_tamanho,
      });
      if (res && res.dados) {
        return res.dados;
      }
    } catch (error) {
      console.warn('[chatService.sendGlobalMessage API offline, storing locally]', error.message);
    }

    // Local fallback message creation
    const newMsg = {
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: user?.id || user?._id || 'local-user',
      user_nome: user?.nome || 'Utilizador ISPOTEC',
      user_tipo: user?.tipo || 'estudante',
      conteudo: conteudo || '',
      tipo_mensagem,
      ficheiro_path,
      ficheiro_nome,
      ficheiro_tamanho,
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    const localMsgs = await this.getGlobalMessages();
    const updated = [...localMsgs, newMsg];
    localStorage.setItem('ispotec_global_chat_messages', JSON.stringify(updated));
    return newMsg;
  },

  async getGroupMessages(groupId) {
    try {
      const res = await api.get(`/chat/group/${groupId}`);
      return res.dados || [];
    } catch (error) {
      console.error('[chatService.getGroupMessages error]', error.message);
      const local = localStorage.getItem(`ispotec_group_chat_${groupId}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async sendGroupMessage({ groupId, conteudo, tipo_mensagem = 'texto', ficheiro_path = null, ficheiro_nome = null, ficheiro_tamanho = null, user = null }) {
    try {
      const res = await api.post(`/chat/group/${groupId}`, {
        conteudo,
        tipo_mensagem,
        ficheiro_path,
        ficheiro_nome,
        ficheiro_tamanho,
      });
      return res.dados;
    } catch (error) {
      console.warn('[chatService.sendGroupMessage fallback]', error.message);
      const newMsg = {
        id: 'local-' + Date.now(),
        group_id: groupId,
        user_id: user?.id || 'local-user',
        user_nome: user?.nome || 'Utilizador ISPOTEC',
        user_tipo: user?.tipo || 'estudante',
        conteudo: conteudo || '',
        tipo_mensagem,
        ficheiro_path,
        ficheiro_nome,
        ficheiro_tamanho,
        data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      const existing = await this.getGroupMessages(groupId);
      const updated = [...existing, newMsg];
      localStorage.setItem(`ispotec_group_chat_${groupId}`, JSON.stringify(updated));
      return newMsg;
    }
  },

  async uploadAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('ficheiro', file);
      const res = await api.upload('/chat/upload', formData);
      return res.dados;
    } catch (error) {
      console.warn('[chatService.uploadAttachment fallback to object URL]', error.message);
      let tipo_mensagem = 'documento';
      if (file.type.startsWith('image/')) {
        tipo_mensagem = 'imagem';
      } else if (file.type.startsWith('audio/')) {
        tipo_mensagem = 'audio';
      }
      return {
        ficheiro_path: URL.createObjectURL(file),
        ficheiro_nome: file.name,
        ficheiro_tamanho: file.size,
        tipo_mensagem,
      };
    }
  },
};

export default chatService;

