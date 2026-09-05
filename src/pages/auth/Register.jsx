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
    <div>
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <img 
          src="/assets/img/logo-ispotec.png" 
          alt="ISPOTEC Online"
          style={{ maxHeight: '120px' }}
        />
      </div>

      <div className="container">
        <div style={{
          maxWidth: '600px',
          margin: '2rem auto 4rem',
          background: 'var(--white)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '2rem' }}>
            Registar-se na ISPOTEC Online
          </h2>

          {erro && <div className="alert alert-error">{erro}</div>}

          {sucesso ? (
            <div className="alert alert-success">
              {sucesso}
              <p style={{ marginTop: '0.5rem' }}>
                Pode <Link to="/auth/login" style={{ color: '#155724', fontWeight: 'bold' }}>fazer login aqui</Link> quando sua conta for aprovada.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo:</label>
                <input 
                  type="text" 
                  id="nome" 
                  name="nome" 
                  value={formData.nome}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Institucional:</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo">Tipo de Utilizador:</label>
                <select 
                  id="tipo" 
                  name="tipo" 
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione o tipo...</option>
                  <option value="estudante">Estudante</option>
                  <option value="docente">Docente</option>
                  <option value="especialista">Especialista</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="curso">Curso/Área:</label>
                <input 
                  type="text" 
                  id="curso" 
                  name="curso" 
                  value={formData.curso}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nivel_academico">Nível Académico:</label>
                <select 
                  id="nivel_academico" 
                  name="nivel_academico"
                  value={formData.nivel_academico}
                  onChange={handleChange}
                >
                  <option value="">Seleccione o nível...</option>
                  <option value="licenciatura">Licenciatura</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutoramento">Doutoramento</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  title="Mínimo 8 caracteres"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirmar Password:</label>
                <input 
                  type="password" 
                  id="confirm_password" 
                  name="confirm_password" 
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
                disabled={loading}
              >
                {loading ? 'A registar...' : 'Registar'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Já tem conta? <Link to="/auth/login" style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Entrar aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
