import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { portfolioService } from '../../services/portfolioService';

const categorias = [
  { id: 'projeto', icon: '🚀', label: 'Projeto' },
  { id: 'trabalho_academico', icon: '📝', label: 'Trabalho Académico' },
  { id: 'artigo', icon: '📄', label: 'Artigo Científico' },
  { id: 'certificado', icon: '🏆', label: 'Certificado' },
  { id: 'portfolio', icon: '💼', label: 'Portfólio' },
  { id: 'outro', icon: '📎', label: 'Outro' }
];

export default function PortfolioAdd() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fileName, setFileName] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!titulo.trim() || !categoria) {
      setErro('Título e categoria são obrigatórios');
      return;
    }

    try {
      await portfolioService.addItem({
        userId: user.id,
        titulo,
        descricao,
        categoria,
        ficheiro: '#'
      });

      setMensagem('Item adicionado ao portfólio com sucesso!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch {
      setErro('Erro ao adicionar item ao portfólio');
    }
  };

  return (
    <>
      <style>{`
        .page-header {
            margin-bottom: 1.5rem;
        }
        .page-header a {
            color: var(--secondary-blue);
            text-decoration: none;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        .page-header h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-dark);
            margin: 0.75rem 0 0;
        }
        .page-header p {
            color: var(--text-muted);
            margin: 0.25rem 0 0;
        }
        
        .form-card {
            max-width: 600px;
            margin: 0 auto;
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 2rem;
            border: 1px solid var(--border-color);
        }
        
        .form-section-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 0 0 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .category-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        .category-option {
            position: relative;
        }
        .category-option input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        }
        .category-option label {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0.75rem 0.5rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }
        .category-option label:hover {
            border-color: var(--secondary-blue);
            background: #f0f7ff;
        }
        .category-option input:checked + label {
            border-color: var(--secondary-blue);
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }
        .category-option .icon {
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
        }
        .category-option .text {
            font-size: 0.8rem;
            font-weight: 500;
            color: var(--text-dark);
        }

        @media (max-width: 600px) {
            .category-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
      `}</style>

      <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="page-header">
            <Link to="/profile">← Voltar ao Perfil</Link>
            <h1>Adicionar ao Portfólio</h1>
            <p>Partilhe os seus trabalhos, projetos e certificações com a comunidade académica</p>
          </div>

          {mensagem && <div className="alert alert-success">{mensagem}</div>}
          {erro && <div className="alert alert-error">{erro}</div>}

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">
                <span>📁</span> Categoria do Item
              </div>

              <div className="category-grid">
                {categorias.map(cat => (
                  <div className="category-option" key={cat.id}>
                    <input 
                      type="radio" 
                      id={`cat_${cat.id}`} 
                      name="categoria" 
                      value={cat.id}
                      checked={categoria === cat.id}
                      onChange={(e) => setCategoria(e.target.value)}
                    />
                    <label htmlFor={`cat_${cat.id}`}>
                      <span className="icon">{cat.icon}</span>
                      <span className="text">{cat.label}</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="titulo">Título do Trabalho/Projeto:</label>
                <input 
                  type="text" 
                  id="titulo" 
                  name="titulo" 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Sistema de Gestão Hospitalar" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição:</label>
                <textarea 
                  id="descricao" 
                  name="descricao" 
                  rows="4" 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o objetivo, tecnologias utilizadas e resultados alcançados..." 
                />
              </div>

              <div className="form-group">
                <label htmlFor="ficheiro">Ficheiro (Documento, PDF, Apresentação):</label>
                <input 
                  type="file" 
                  id="ficheiro" 
                  name="ficheiro" 
                  onChange={handleFileChange}
                />
                {fileName && <small style={{ color: 'var(--text-muted)' }}>Selecionado: {fileName}</small>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}
              >
                Adicionar ao Portfólio
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
