import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!email.trim() || !password) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.sucesso) {
      setSucesso(res.mensagem);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
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
          maxWidth: '500px',
          margin: '2rem auto 4rem',
          background: 'var(--white)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '2rem' }}>
            Entrar na Plataforma
          </h2>

          {erro && <div className="alert alert-error">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Institucional:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: admin@ispotec.online"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
              disabled={loading}
            >
              {loading ? 'A verificar...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Não tem conta? <Link to="/auth/register" style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Registar aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
