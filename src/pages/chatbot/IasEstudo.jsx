import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studyToolService } from '../../services/studyToolService';

export default function IasEstudo() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function loadTools() {
      setLoading(true);
      const data = await studyToolService.getAll();
      setTools(data);
      setLoading(false);
    }
    loadTools();
  }, []);

  const filteredTools = tools.filter(tool => {
    const categories = tool.categories || [tool.category];
    const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);
    const matchesSearch = !searchTerm.trim() || 
      (tool.title && tool.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tool.categoryLabel && tool.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <style>{`
        .ias-page {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding-bottom: 4rem;
        }

        .navbar-glass {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            padding: 1rem 0;
            margin-bottom: 0;
        }
        
        .navbar-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .hero-section-ias {
            background: linear-gradient(135deg, var(--primary-blue), var(--accent-purple));
            color: white;
            padding: 4rem 1rem;
            margin-bottom: 3rem;
            border-radius: 0 0 2rem 2rem;
            text-align: center;
        }
        
        .hero-title-ias {
            font-size: 2.8rem;
            font-weight: 800;
            margin-bottom: 1rem;
        }
        
        .hero-subtitle-ias {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 700px;
            margin: 0 auto 2rem;
        }
        
        .feature-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50px;
            font-size: 0.9rem;
            margin: 0 0.3rem 0.5rem;
        }
        
        .card-tool {
            border: none;
            border-radius: 1.2rem;
            overflow: hidden;
            background: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
            position: relative;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            text-align: center;
        }
        
        .card-tool:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .card-icon {
            width: 70px;
            height: 70px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 1.5rem;
            transition: all 0.3s;
        }
        
        .card-tool:hover .card-icon {
            transform: scale(1.1);
        }
        
        .tool-category {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--light-gray);
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
        }
        
        .tool-btn {
            padding: 0.7rem 1.8rem;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s;
            border: none;
            margin-top: auto;
        }
        
        .tool-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            color: white;
        }
        
        .search-box {
            max-width: 600px;
            margin: 2rem auto;
            position: relative;
        }
        
        .search-box input {
            border-radius: 50px;
            padding: 1rem 1.5rem 1rem 3rem;
            border: 2px solid #e5e7eb;
            font-size: 1rem;
            transition: all 0.3s;
            width: 100%;
        }
        
        .search-box input:focus {
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 1.2rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }
        
        .filter-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 2rem 0;
        }
        
        .filter-btn {
            padding: 0.5rem 1.2rem;
            border-radius: 50px;
            border: 2px solid #e5e7eb;
            background: white;
            color: var(--text-dark);
            font-weight: 500;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .filter-btn:hover, .filter-btn.active {
            background: var(--primary-blue);
            color: white;
            border-color: var(--primary-blue);
        }
        
        .stats-container {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            margin-bottom: 3rem;
        }
        
        .stats-grid-ias {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1.5rem;
            text-align: center;
        }
        
        .stat-number-ias {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary-blue), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .stat-label-ias {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .tool-description {
            color: var(--text-muted);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            min-height: 72px;
        }
        
        .additional-resources {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        .resource-card {
            display: flex;
            align-items: center;
            padding: 1rem 1.25rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            gap: 1rem;
        }

        @media (max-width: 768px) {
            .hero-title-ias {
                font-size: 2rem;
            }
            .hero-section-ias {
                padding: 3rem 1rem;
                border-radius: 0 0 1.5rem 1.5rem;
            }
            .tools-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <div className="ias-page">
        {/* Navbar */}
        <nav className="navbar-glass">
          <div className="container navbar-container">
            <Link to="/dashboard" style={{ fontWeight: 'bold', textDecoration: 'none', color: 'var(--text-dark)', fontSize: '1.1rem' }}>
              🎓 ISPOTEC IA
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/chatbot" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                🤖 Chatbot
              </Link>
              <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                🏠 Início
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="hero-section-ias">
          <div className="container">
            <h1 className="hero-title-ias">🚀 Assistentes de IA para Estudantes</h1>
            <p className="hero-subtitle-ias">
              Descubra as melhores ferramentas inteligentes para maximizar seu aprendizado, 
              pesquisa e produtividade académica
            </p>
            <div>
              <span className="feature-badge">⚡ Rápido</span>
              <span className="feature-badge">🛡️ Confiável</span>
              <span className="feature-badge">🎓 Educacional</span>
              <span className="feature-badge">🚀 Produtivo</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Search & Filters */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Pesquisar ferramentas (ex: PDF, flashcards, pesquisa)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button 
              type="button"
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Todas
            </button>
            <button 
              type="button"
              className={`filter-btn ${activeCategory === 'tutoring' ? 'active' : ''}`}
              onClick={() => setActiveCategory('tutoring')}
            >
              Tutoria
            </button>
            <button 
              type="button"
              className={`filter-btn ${activeCategory === 'research' ? 'active' : ''}`}
              onClick={() => setActiveCategory('research')}
            >
              Pesquisa
            </button>
            <button 
              type="button"
              className={`filter-btn ${activeCategory === 'writing' ? 'active' : ''}`}
              onClick={() => setActiveCategory('writing')}
            >
              Escrita
            </button>
            <button 
              type="button"
              className={`filter-btn ${activeCategory === 'study' ? 'active' : ''}`}
              onClick={() => setActiveCategory('study')}
            >
              Estudo
            </button>
          </div>

          {/* Stats */}
          <div className="stats-container">
            <div className="stats-grid-ias">
              <div>
                <div className="stat-number-ias">6+</div>
                <div className="stat-label-ias">Ferramentas</div>
              </div>
              <div>
                <div className="stat-number-ias">4</div>
                <div className="stat-label-ias">Categorias</div>
              </div>
              <div>
                <div className="stat-number-ias">100%</div>
                <div className="stat-label-ias">Gratuitas</div>
              </div>
              <div>
                <div className="stat-number-ias">24/7</div>
                <div className="stat-label-ias">Disponível</div>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              A carregar ferramentas de estudo...
            </div>
          ) : filteredTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Nenhuma ferramenta encontrada</h3>
              <p style={{ color: 'var(--text-muted)' }}>Tente ajustar a sua pesquisa ou selecionar outra categoria.</p>
            </div>
          ) : (
            <div className="tools-grid">
              {filteredTools.map(tool => (
                <div className="card-tool" key={tool.id}>
                  <span className="tool-category">{tool.categoryLabel}</span>
                  <div className="card-icon" style={{ background: tool.gradient, color: 'white' }}>
                    <i className={tool.iconClass}></i>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                    {tool.title}
                  </h4>
                  <p className="tool-description">
                    {tool.description}
                  </p>
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="tool-btn" 
                    style={{ background: tool.gradient, color: 'white' }}
                  >
                    <i className={tool.btnIcon}></i> {tool.btnText}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Additional Resources */}
          <div className="additional-resources">
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📚 Mais Recursos para Estudo
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="resource-card">
                <div style={{ fontSize: '1.75rem', background: '#e0e7ff', padding: '0.75rem', borderRadius: '8px' }}>
                  📖
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Khan Academy</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Videoaulas e exercícios em diversas disciplinas</p>
                </div>
                <a href="https://www.khanacademy.org" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Acessar
                </a>
              </div>

              <div className="resource-card">
                <div style={{ fontSize: '1.75rem', background: '#d1fae5', padding: '0.75rem', borderRadius: '8px' }}>
                  🌐
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>DeepL Tradutor</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tradução precisa de textos académicos</p>
                </div>
                <a href="https://www.deepl.com" target="_blank" rel="noreferrer" className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Traduzir
                </a>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/chatbot" className="btn btn-outline">
              ← Voltar ao Chatbot
            </Link>
            <small style={{ color: 'var(--text-muted)' }}>
              🛡️ Estas ferramentas são externas ao ISPOTEC. Use com responsabilidade académica.
            </small>
          </div>
        </div>
      </div>
    </>
  );
}
