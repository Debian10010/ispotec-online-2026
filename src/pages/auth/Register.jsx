import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInstitution } from '../../context/InstitutionContext';
import { CURSOS_IFOPTEC, CURSOS_ISPOTEC } from '../../services/homeschoolService';

export default function Register() {
  const [searchParams] = useSearchParams();
  const { institution, isIfoptec } = useInstitution();

  const initialInst = searchParams.get('instituicao') === 'ifoptec' || isIfoptec ? 'ifoptec' : 'ispotec';

  const [instituicao, setInstituicao] = useState(initialInst);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirm_password: '',
    tipo: '',
    curso: '',
    nivel_academico: initialInst === 'ifoptec' ? 'tecnico_medio' : ''
  });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  useEffect(() => {
    if (instituicao === 'ifoptec') {
      if (!formData.nivel_academico || formData.nivel_academico === 'licenciatura' || formData.nivel_academico === 'mestrado') {
        setFormData(prev => ({ ...prev, nivel_academico: 'tecnico_medio' }));
      }
    }
  }, [instituicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInstituicaoChange = (e) => {
    const val = e.target.value;
    setInstituicao(val);
    setFormData(prev => ({
      ...prev,
      curso: '',
      nivel_academico: val === 'ifoptec' ? 'tecnico_medio' : 'licenciatura'
    }));
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
      nivel_academico,
      instituicao_id: instituicao,
      instituicao_nome: instituicao === 'ifoptec' ? 'IFOPTEC Online' : 'ISPOTEC Online'
    });
    setLoading(false);

    if (res.sucesso) {
      setSucesso(res.mensagem || 'Registo realizado com sucesso!');
    } else {
      setErro(res.mensagem || 'Ocorreu um erro no registo.');
    }
  };

  const cursosDisponiveis = instituicao === 'ifoptec' ? CURSOS_IFOPTEC : CURSOS_ISPOTEC;

  return (
    <div style={{ padding: '2.5rem 1rem 4rem', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src={instituicao === 'ifoptec' ? '/assets/img/logo-ifoptec.png' : '/assets/img/logo-ispotec.png'} 
            alt={instituicao === 'ifoptec' ? 'IFOPTEC Online' : 'ISPOTEC Online'}
            style={{ height: '76px', width: 'auto', marginBottom: '1rem', borderRadius: instituicao === 'ifoptec' ? '50%' : '8px' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--isp-navy-950)', margin: '0 0 0.35rem' }}>
            Registo Académico Multi-Instituição
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--isp-slate-500)', margin: 0 }}>
            Plataforma Integrada ISPOTEC &amp; IFOPTEC Online
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
              {/* Institution Selection */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="instituicao" style={{ fontWeight: 700, color: '#0055a4' }}>
                  🏛️ Selecione a Instituição
                </label>
                <select
                  id="instituicao"
                  value={instituicao}
                  onChange={handleInstituicaoChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: '8px',
                    border: '2px solid #bfdbfe',
                    fontWeight: 600,
                    fontSize: '0.92rem'
                  }}
                >
                  <option value="ispotec">ISPOTEC Online — Instituto Superior Politécnico e de Tecnologias</option>
                  <option value="ifoptec">IFOPTEC Online — Instituto de Formação Politécnica e de Tecnologias (Ensino Médio e Saúde)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome Completo *</label>
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
                <label htmlFor="email">Email de Acesso *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={instituicao === 'ifoptec' ? 'estudante@ifoptec.online' : 'estudante@ispotec.online'}
                  required 
                  autoComplete="email"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="tipo">Perfil de Acesso *</label>
                  <select 
                    id="tipo" 
                    name="tipo" 
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="estudante">Estudante / Aluno</option>
                    <option value="docente">Docente / Formador</option>
                    <option value="especialista">Especialista / Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="nivel_academico">Nível Académico *</label>
                  <select 
                    id="nivel_academico" 
                    name="nivel_academico"
                    value={formData.nivel_academico}
                    onChange={handleChange}
                  >
                    {instituicao === 'ifoptec' ? (
                      <>
                        <option value="tecnico_medio">Técnico Médio (3 Anos)</option>
                        <option value="curta_duracao">Curta Duração (6 Meses)</option>
                        <option value="iniciacao">Iniciação Profissional</option>
                      </>
                    ) : (
                      <>
                        <option value="licenciatura">Licenciatura</option>
                        <option value="mestrado">Mestrado</option>
                        <option value="doutoramento">Doutoramento</option>
                        <option value="tecnico">Técnico Superior</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="curso">
                  {instituicao === 'ifoptec' ? 'Curso Técnico ou Especialidade IFOPTEC *' : 'Curso ISPOTEC *'}
                </label>
                <input 
                  type="text" 
                  id="curso" 
                  name="curso" 
                  list="lista_cursos"
                  value={formData.curso}
                  onChange={handleChange}
                  placeholder={instituicao === 'ifoptec' ? 'Ex: Técnico de Medicina Geral, Enfermagem...' : 'Ex: Engenharia Informática, Gestão...'}
                  required
                />
                <datalist id="lista_cursos">
                  {cursosDisponiveis.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="password">Palavra-passe *</label>
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
                  <label htmlFor="confirm_password">Confirmar Palavra-passe *</label>
                  <input 
                    type="password" 
                    id="confirm_password" 
                    name="confirm_password" 
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repita a password"
                    required 
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'A registar conta...' : `Concluir Registo no ${instituicao.toUpperCase()}`}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--isp-slate-100)', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--isp-slate-500)' }}>Já tem uma conta criada? </span>
            <Link to="/auth/login" style={{ color: 'var(--isp-blue-600)', fontWeight: 600 }}>
              Iniciar Sessão
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
