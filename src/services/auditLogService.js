import { api } from './api';

const STORAGE_KEY = 'ispotec_audit_logs';

export const auditLogService = {
  async getLogs(params = {}) {
    try {
      const res = await api.get('/audit-logs', { params });
      if (res && res.sucesso && Array.isArray(res.dados)) {
        // Sync local storage with latest remote logs
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.dados));
        return res.dados;
      }
    } catch (err) {
      console.warn('[auditLogService.getLogs fallback]', err.message);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let logs = raw ? JSON.parse(raw) : [];
      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase();
        logs = logs.filter(l =>
          (l.autor_nome || '').toLowerCase().includes(q) ||
          (l.acao || '').toLowerCase().includes(q) ||
          (l.detalhes || '').toLowerCase().includes(q) ||
          (l.utilizador_afetado_nome || '').toLowerCase().includes(q) ||
          (l.utilizador_afetado_email || '').toLowerCase().includes(q)
        );
      }
      return logs;
    } catch {
      return [];
    }
  },

  async addLog({ acao, detalhes = '', utilizadorAfetado = null, autor = null }) {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      data_hora: new Date().toISOString(),
      autor_id: autor?.id || autor?._id || '',
      autor_nome: autor?.nome || 'Administrador',
      autor_email: autor?.email || '',
      acao,
      detalhes,
      utilizador_afetado_id: utilizadorAfetado?.id || utilizadorAfetado?._id || '',
      utilizador_afetado_nome: utilizadorAfetado?.nome || utilizadorAfetado?.email || '',
      utilizador_afetado_email: utilizadorAfetado?.email || '',
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newLog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
    } catch {}

    try {
      await api.post('/audit-logs', {
        acao,
        detalhes,
        utilizador_afetado_id: newLog.utilizador_afetado_id,
        utilizador_afetado_nome: newLog.utilizador_afetado_nome,
        utilizador_afetado_email: newLog.utilizador_afetado_email,
      });
    } catch (err) {
      console.warn('[auditLogService.addLog backend sync failed]', err.message);
    }

    return newLog;
  },
};

export default auditLogService;
