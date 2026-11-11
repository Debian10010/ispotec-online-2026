import { api } from './api';

export const userService = {
  async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.curso) params.append('curso', filters.curso);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/users${queryStr}`);
      return res.dados || [];
    } catch (error) {
      console.error('[userService.getAllUsers error]', error.message);
      return [];
    }
  },

  async getPendingUsers() {
    try {
      const res = await api.get('/users?status=pendente');
      return res.dados || [];
    } catch (error) {
      console.error('[userService.getPendingUsers error]', error.message);
      return [];
    }
  },

  async createUser(userData) {
    try {
      const res = await api.post('/users', userData);
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Utilizador criado com sucesso.',
        dados: res.dados,
      };
    } catch (error) {
      console.error('[userService.createUser error]', error.message);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao criar utilizador.',
      };
    }
  },

  async deleteUser(userId) {
    try {
      const res = await api.delete(`/users/${userId}`);
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Utilizador eliminado com sucesso.',
      };
    } catch (error) {
      console.error('[userService.deleteUser error]', error.message);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao eliminar utilizador.',
      };
    }
  },

  async updateUserProfileByAdmin(userId, data) {
    try {
      const res = await api.put(`/users/${userId}`, {
        nome: data.nome,
        email: data.email,
        foto_perfil: data.foto_perfil,
        curso: data.curso,
        cursos_associados: data.cursos_associados,
        ano_curricular: data.ano_curricular,
        semestre_curricular: data.semestre_curricular,
        nivel_academico: data.nivel_academico,
        tipo: data.tipo,
        telefone: data.telefone,
        numero_estudante: data.numero_estudante,
        status: data.status,
      });
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Perfil atualizado com sucesso.',
        dados: res.dados,
      };
    } catch (error) {
      console.error('[userService.updateUserProfileByAdmin error]', error.message);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao atualizar perfil do utilizador.',
      };
    }
  },

  async associarCurso(userId, data) {
    try {
      const res = await api.put(`/users/${userId}/curso`, data);
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Curso associado com sucesso.',
        dados: res.dados,
      };
    } catch (error) {
      console.warn('[userService.associarCurso fallback to update]', error.message);
      return await this.updateUserProfileByAdmin(userId, data);
    }
  },

  async removerCurso(userId, curso) {
    try {
      const res = await api.delete(`/users/${userId}/curso`, { data: { curso } });
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Estudante removido do curso com sucesso.',
        dados: res.dados,
      };
    } catch (error) {
      console.warn('[userService.removerCurso fallback]', error.message);
      const user = await this.getUserById(userId);
      if (user) {
        const remaining = (user.cursos_associados || []).filter(c => c !== curso);
        return await this.updateUserProfileByAdmin(userId, {
          cursos_associados: remaining,
          curso: user.curso === curso ? (remaining[0] || '') : user.curso,
        });
      }
      return { sucesso: false, mensagem: error.message };
    }
  },

  async resetPasswordByAdmin(userId, newPassword, mustChange = true) {
    try {
      const res = await api.patch(`/users/${userId}/password`, {
        password: newPassword,
        must_change_password: mustChange,
      });
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Palavra-passe alterada com sucesso.',
      };
    } catch (error) {
      console.error('[userService.resetPasswordByAdmin error]', error.message);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao alterar palavra-passe.',
      };
    }
  },

  // RF02 — Alterar própria palavra-passe
  async changeMyPassword(currentPassword, newPassword, confirmPassword) {
    try {
      const res = await api.put('/profile/me/password', {
        senha_atual: currentPassword,
        nova_senha: newPassword,
        confirmar_senha: confirmPassword,
      });
      return {
        sucesso: true,
        mensagem: res.mensagem || 'Palavra-passe alterada com sucesso.',
      };
    } catch (error) {
      console.error('[userService.changeMyPassword error]', error.message);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao alterar palavra-passe.',
      };
    }
  },

  async updateStatus(userId, newStatus) {
    try {
      const res = await api.patch(`/users/${userId}/status`, { status: newStatus });
      return !!res.sucesso;
    } catch (error) {
      console.error('[userService.updateStatus error]', error.message);
      return false;
    }
  },

  async getUserById(userId) {
    try {
      const res = await api.get(`/users/${userId}`);
      return res.dados || null;
    } catch (error) {
      console.error('[userService.getUserById error]', error.message);
      return null;
    }
  },

  async updateProfile(userId, data) {
    try {
      const res = await api.put('/profile/me', data);
      return res.dados || null;
    } catch (error) {
      console.error('[userService.updateProfile error]', error.message);
      throw error;
    }
  },

  async updateAvatar(userId, avatarUrlOrFile) {
    try {
      let res;
      if (avatarUrlOrFile instanceof File) {
        const formData = new FormData();
        formData.append('avatar', avatarUrlOrFile);
        res = await api.upload('/profile/avatar', formData);
      } else {
        res = await api.post('/profile/avatar', { foto_perfil: avatarUrlOrFile });
      }
      return !!res.sucesso;
    } catch (error) {
      console.error('[userService.updateAvatar error]', error.message);
      return false;
    }
  },

  async getCounts() {
    try {
      const res = await api.get('/users/counts');
      return res.dados || { aprovados: 0, pendentes: 0 };
    } catch (error) {
      console.error('[userService.getCounts error]', error.message);
      return { aprovados: 0, pendentes: 0 };
    }
  },
};

export default userService;
