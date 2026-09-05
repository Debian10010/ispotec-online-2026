import { initialPortfolio } from '../data/portfolio';

const PORTFOLIO_STORAGE_KEY = 'ispotec_portfolio';

function getPortfolio() {
  const data = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(initialPortfolio));
    return initialPortfolio;
  }
  try { return JSON.parse(data); } catch { return initialPortfolio; }
}

function savePortfolio(items) {
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));
}

export const portfolioService = {
  async getByUserId(userId) {
    const items = getPortfolio();
    return items.filter(item => item.user_id === Number(userId));
  },

  async addItem({ userId, titulo, descricao, categoria, ficheiro }) {
    const items = getPortfolio();
    const newItem = {
      id: Date.now(),
      user_id: Number(userId),
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : '',
      categoria: categoria || 'outro',
      ficheiro: ficheiro || '#',
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    items.unshift(newItem);
    savePortfolio(items);
    return newItem;
  }
};
