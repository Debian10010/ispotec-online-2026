import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirm_password: '',
    tipo: '',
    curso: '',
    nivel_academico: ''
  });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const { nome, email, password, confirm_password, tipo, curso, nivel_academico } = formData;

    if (!nome.trim() || !email.trim() || !password || !tipo) {
      setErro('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirm_password) {
      setErro('As passwords não coincidem');
      return;
    }

    if (password.length < 8) {
      setErro('A password deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);
    const res = await register({
      nome,
      email,
      password,
      tipo,
      curso,
      nivel_academico
    });
    setLoading(false);

    if (res.sucesso) {
      setSucesso(res.mensagem);
    } else {
      setErro(res.mensagem);
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem 4rem', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src="/assets/img/logo-ispotec.png" 
            alt="ISPOTEC Online"
            style={{ height: '72px', width: 'auto', marginBottom: '1rem' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--isp-navy-950)', margin: '0 0 0.35rem' }}>
            Registo Académico
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--isp-slate-500)', margin: 0 }}>
            Crie a sua conta de membro na comunidade ISPOTEC Online
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--isp-shadow-lg)', border: '1px solid var(--isp-slate-200)' }}>
          {erro && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <span>{erro}</span>
            </div>
          )}

          {sucesso ? (
            <div className="alert alert-success" style={{ display: 'block', textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Registo Submetido com Sucesso!</h3>
              <p style={{ fontSize: '0.88rem', margin: '0 0 1rem' }}>{sucesso}</p>
              <Link to="/auth/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Ir para Iniciar Sessão
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <input 
                  type="text" 
                  id="nome" 
                  name="nome" 
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Ana Maria Silva"
                  required 
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Institucional</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@ispotec.online"
                  required 
                  autoComplete="email"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="tipo">Perfil de Acesso</label>
                  <select 
                    id="tipo" 
                    name="tipo" 
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="estudante">Estudante</option>
                    <option value="docente">Docente</option>
                    <option value="especialista">Especialista (Admin)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="nivel_academico">Nível Académico</label>
                  <select 
                    id="nivel_academico" 
                    name="nivel_academico"
                    value={formData.nivel_academico}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione...</option>
                    <option value="licenciatura">Licenciatura</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutoramento">Doutoramento</option>
                    <option value="tecnico">Técnico</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="curso">Curso ou Especialidade</label>
                <input 
                  type="text" 
                  id="curso" 
                  name="curso" 
                  value={formData.curso}
                  onChange={handleChange}
                  placeholder="Ex: Engenharia Informática, Gestão..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="password">Palavra-passe</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 caracteres"
                    required 
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="confirm_password">Confirmar Palavra-passe</label>
                  <input 
                    type="password" 
                    id="confirm_password" 
                    name="confirm_password" 
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repita a palavra-passe"
                    required 
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
                disabled={loading}
              >
                {loading ? 'A registar conta...' : 'Submeter Registo'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--isp-slate-100)', textAlign: 'center', fontSize: '0.88rem', color: 'var(--isp-slate-600)' }}>
            Já tem uma conta registada?{' '}
            <Link to="/auth/login" style={{ color: 'var(--isp-blue-600)', textDecoration: 'none', fontWeight: 700 }}>
              Iniciar sessão
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--isp-slate-400)' }}>
          © {new Date().getFullYear()} ISPOTEC • Instituto Superior Politécnico de Tecnologias e Ciências
        </div>
      </div>
    </div>
  );
}
