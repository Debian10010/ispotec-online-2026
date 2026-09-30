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
    <div style={{ padding: '2.5rem 1rem 4rem', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src="/assets/img/logo-ispotec.png" 
            alt="ISPOTEC Online"
            style={{ height: '72px', width: 'auto', marginBottom: '1rem' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--isp-navy-950)', margin: '0 0 0.35rem' }}>
            Portal Académico ISPOTEC
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--isp-slate-500)', margin: 0 }}>
            Inicie sessão com as suas credenciais institucionais
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--isp-shadow-lg)', border: '1px solid var(--isp-slate-200)' }}>
          {erro && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <span>{erro}</span>
            </div>
          )}
          {sucesso && (
            <div className="alert alert-success" role="alert">
              <span>✓</span>
              <span>{sucesso}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Institucional</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@ispotec.online"
                required 
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Palavra-passe</label>
              </div>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'A validar credenciais...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--isp-slate-100)', textAlign: 'center', fontSize: '0.88rem', color: 'var(--isp-slate-600)' }}>
            Ainda não tem conta?{' '}
            <Link to="/auth/register" style={{ color: 'var(--isp-blue-600)', textDecoration: 'none', fontWeight: 700 }}>
              Registar nova conta
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
