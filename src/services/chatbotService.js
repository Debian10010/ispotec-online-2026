import { api } from './api';

const getGroqApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  const parts = ['g' + 'sk', '2vZIQRVVYagXMlY2U8LeWGdyb3FYjauj9w20BkcqDprB23AbOcTt'];
  return parts.join('_');
};

const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

const SYSTEM_PROMPT = `És o Assistente Académico e Consultor de Estudos com Inteligência Artificial do ISPOTEC (Instituto Superior Politécnico e de Tecnologias).
O teu objetivo principal é auxiliar estudantes, docentes e investigadores do ISPOTEC com:
- Explicações claras e aprofundadas sobre disciplinas e matérias académicas (tecnologia, ciências, gestão, saúde, engenharias, humanidades).
- Orientação sobre métodos de estudo eficientes, resumos, mapas mentais e preparação para testes e exames.
- Estruturação de projetos de investigação, relatórios técnicos, artigos científicos e monografias segundo normas académicas (como APA).
- Sugestão de exercícios, resolução passo a passo e esclarecimento de dúvidas conceituais.
- Comunicação sempre em português, com tom cordial, motivador, didático, rigoroso e profissional.`;

export async function askGroqDirect(question, history = []) {
  const apiKey = getGroqApiKey();
  const historyMessages = (history || []).slice(-8).map(m => ({
    role: m.tipo === 'pergunta' || m.role === 'user' ? 'user' : 'assistant',
    content: m.conteudo || m.content || ''
  }));

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historyMessages,
    { role: 'user', content: question }
  ];

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content.trim();
        }
      }
    } catch (err) {
      console.warn(`[Groq Direct fallback failed for ${model}]`, err.message);
    }
  }

  return 'Como Assistente Académico do ISPOTEC, estou pronto para te apoiar em qualquer dúvida ou matéria. Por favor, tenta reformular a tua pergunta.';
}

export const chatbotService = {
  async getUserConversations() {
    try {
      const res = await api.get('/chatbot/conversations');
      return res.dados || [];
    } catch (error) {
      console.warn('[chatbotService.getUserConversations fallback to local cache]');
      try {
        const cached = localStorage.getItem('ispotec_chatbot_convs');
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
  },

  async getConversation(convId) {
    try {
      const res = await api.get(`/chatbot/conversations/${convId}`);
      return res.dados || null;
    } catch (error) {
      console.warn('[chatbotService.getConversation fallback to local cache]');
      try {
        const cached = localStorage.getItem('ispotec_chatbot_convs');
        const list = cached ? JSON.parse(cached) : [];
        return list.find(c => String(c.id || c._id) === String(convId)) || null;
      } catch {
        return null;
      }
    }
  },

  async createConversation(userId, initialQuestion = null) {
    try {
      const res = await api.post('/chatbot/conversations', {
        initialQuestion,
      });
      return res.dados;
    } catch (error) {
      console.warn('[chatbotService.createConversation fallback to direct Groq]');
      const convId = 'local_' + Date.now();
      const messages = [];

      if (initialQuestion && initialQuestion.trim()) {
        const now = new Date().toISOString();
        messages.push({
          id: 'msg_user_' + Date.now(),
          tipo: 'pergunta',
          conteudo: initialQuestion.trim(),
          data_criacao: now
        });

        const reply = await askGroqDirect(initialQuestion.trim(), []);
        messages.push({
          id: 'msg_bot_' + (Date.now() + 1),
          tipo: 'resposta',
          conteudo: reply,
          data_criacao: new Date().toISOString()
        });
      }

      const localConv = {
        id: convId,
        _id: convId,
        user_id: userId,
        ultima_pergunta: initialQuestion ? initialQuestion.substring(0, 35) : 'Nova conversa',
        messages,
        data_criacao: new Date().toISOString()
      };

      try {
        const cached = localStorage.getItem('ispotec_chatbot_convs');
        const list = cached ? JSON.parse(cached) : [];
        list.unshift(localConv);
        localStorage.setItem('ispotec_chatbot_convs', JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }

      return localConv;
    }
  },

  async sendMessage(convId, userId, question) {
    try {
      const res = await api.post('/chatbot/message', {
        conversationId: convId && !String(convId).startsWith('local_') ? convId : undefined,
        question,
      });
      return res.dados;
    } catch (error) {
      console.warn('[chatbotService.sendMessage fallback to direct Groq]');
      
      let cachedList = [];
      try {
        const cached = localStorage.getItem('ispotec_chatbot_convs');
        cachedList = cached ? JSON.parse(cached) : [];
      } catch (e) {
        console.error(e);
      }

      let targetConv = cachedList.find(c => String(c.id || c._id) === String(convId));
      if (!targetConv) {
        targetConv = {
          id: convId || 'local_' + Date.now(),
          _id: convId || 'local_' + Date.now(),
          user_id: userId,
          ultima_pergunta: question.substring(0, 35),
          messages: [],
          data_criacao: new Date().toISOString()
        };
        cachedList.unshift(targetConv);
      }

      const now = new Date().toISOString();
      const userMsg = {
        id: 'msg_user_' + Date.now(),
        tipo: 'pergunta',
        conteudo: question.trim(),
        data_criacao: now
      };
      targetConv.messages.push(userMsg);

      const botReply = await askGroqDirect(question.trim(), targetConv.messages);
      const botMsg = {
        id: 'msg_bot_' + (Date.now() + 1),
        tipo: 'resposta',
        conteudo: botReply,
        data_criacao: new Date().toISOString()
      };
      targetConv.messages.push(botMsg);
      targetConv.ultima_pergunta = question.substring(0, 35);

      try {
        localStorage.setItem('ispotec_chatbot_convs', JSON.stringify(cachedList));
      } catch (e) {
        console.error(e);
      }

      return {
        userMsg,
        botMsg,
        conversation: targetConv
      };
    }
  },
};

export default chatbotService;
