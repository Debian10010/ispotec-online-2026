import { initialGlobalMessages, initialGroupMessages } from '../data/messages';

const GLOBAL_CHAT_KEY = 'ispotec_global_chat';
const GROUP_CHAT_KEY = 'ispotec_group_chat';

function getGlobalMessages() {
  const data = localStorage.getItem(GLOBAL_CHAT_KEY);
  if (!data) {
    localStorage.setItem(GLOBAL_CHAT_KEY, JSON.stringify(initialGlobalMessages));
    return initialGlobalMessages;
  }
  try { return JSON.parse(data); } catch { return initialGlobalMessages; }
}

function saveGlobalMessages(msgs) {
  localStorage.setItem(GLOBAL_CHAT_KEY, JSON.stringify(msgs));
}

function getGroupMessagesMap() {
  const data = localStorage.getItem(GROUP_CHAT_KEY);
  if (!data) {
    localStorage.setItem(GROUP_CHAT_KEY, JSON.stringify(initialGroupMessages));
    return initialGroupMessages;
  }
  try { return JSON.parse(data); } catch { return initialGroupMessages; }
}

function saveGroupMessagesMap(map) {
  localStorage.setItem(GROUP_CHAT_KEY, JSON.stringify(map));
}

export const chatService = {
  async getGlobalMessages() {
    return getGlobalMessages();
  },

  async sendGlobalMessage({ user, conteudo, tipo_mensagem = 'texto', ficheiro_path = null, ficheiro_nome = null, ficheiro_tamanho = null }) {
    const msgs = getGlobalMessages();
    const newMsg = {
      id: Date.now(),
      user_id: user.id,
      user_nome: user.nome,
      user_tipo: user.tipo,
      conteudo: conteudo || '',
      tipo_mensagem,
      ficheiro_path,
      ficheiro_nome,
      ficheiro_tamanho,
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    msgs.push(newMsg);
    saveGlobalMessages(msgs);
    return newMsg;
  },

  async getGroupMessages(groupId) {
    const map = getGroupMessagesMap();
    return map[groupId] || [];
  },

  async sendGroupMessage({ groupId, user, conteudo, tipo_mensagem = 'texto', ficheiro_path = null, ficheiro_nome = null, ficheiro_tamanho = null }) {
    const map = getGroupMessagesMap();
    if (!map[groupId]) {
      map[groupId] = [];
    }
    const newMsg = {
      id: Date.now(),
      group_id: Number(groupId),
      user_id: user.id,
      user_nome: user.nome,
      user_tipo: user.tipo,
      conteudo: conteudo || '',
      tipo_mensagem,
      ficheiro_path,
      ficheiro_nome,
      ficheiro_tamanho,
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    map[groupId].push(newMsg);
    saveGroupMessagesMap(map);
    return newMsg;
  }
};
