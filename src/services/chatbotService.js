import { initialConversations, cannedBotResponses } from '../data/chatbot';

const CHATBOT_STORAGE_KEY = 'ispotec_chatbot_convs';

function getConversations() {
  const data = localStorage.getItem(CHATBOT_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(initialConversations));
    return initialConversations;
  }
  try { return JSON.parse(data); } catch { return initialConversations; }
}

function saveConversations(convs) {
  localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(convs));
}

function generateBotResponse(question) {
  const q = question.toLowerCase();
  for (const item of cannedBotResponses) {
    if (item.keywords.some(kw => q.includes(kw))) {
      return item.response;
    }
  }

  return `Como Consultor Académico da ISPOTEC, estou aqui para apoiar os teus estudos.\n\nEm relação a "${question}":\nRecomendo consultar os manuais da disciplina na biblioteca digital do ISPOTEC e revisar os módulos com o teu docente nos grupos de estudo.\n\nPodes também utilizar as ferramentas inteligentes disponíveis na secção 'Explorar Mais Ferramentas IAs para Estudos' para resumos e aprofundamento.\n\nSe precisares de mais orientações ou referências bibliográficas específicas, diz-me!`;
}

export const chatbotService = {
  async getUserConversations(userId) {
    const convs = getConversations();
    return convs.filter(c => c.user_id === Number(userId)).sort((a, b) => b.id - a.id);
  },

  async getConversation(convId) {
    const convs = getConversations();
    return convs.find(c => c.id === Number(convId)) || null;
  },

  async createConversation(userId, initialQuestion = null) {
    const convs = getConversations();
    const newConvId = Date.now();
    const newConv = {
      id: newConvId,
      user_id: Number(userId),
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ultima_pergunta: initialQuestion ? initialQuestion.substring(0, 30) : 'Nova conversa',
      messages: []
    };

    if (initialQuestion) {
      newConv.messages.push({
        id: Date.now(),
        conversation_id: newConvId,
        tipo: 'pergunta',
        conteudo: initialQuestion,
        data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
      newConv.messages.push({
        id: Date.now() + 1,
        conversation_id: newConvId,
        tipo: 'resposta',
        conteudo: generateBotResponse(initialQuestion),
        data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    }

    convs.unshift(newConv);
    saveConversations(convs);
    return newConv;
  },

  async sendMessage(convId, userId, question) {
    const convs = getConversations();
    let conv = convs.find(c => c.id === Number(convId));

    if (!conv) {
      conv = await this.createConversation(userId);
      convs.unshift(conv);
    }

    conv.ultima_pergunta = question.substring(0, 30);

    const userMsg = {
      id: Date.now(),
      conversation_id: conv.id,
      tipo: 'pergunta',
      conteudo: question,
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    conv.messages.push(userMsg);

    // Simulate thinking delay for realism
    await new Promise(r => setTimeout(r, 600));

    const botResponse = generateBotResponse(question);
    const botMsg = {
      id: Date.now() + 1,
      conversation_id: conv.id,
      tipo: 'resposta',
      conteudo: botResponse,
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    conv.messages.push(botMsg);

    saveConversations(convs);
    return { userMsg, botMsg, conversation: conv };
  }
};
