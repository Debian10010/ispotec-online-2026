import React from 'react';

const categories = [
  {
    id: 'health',
    title: '🏥 Saúde e Simulação Médica',
    description: 'Plataformas para treino clínico, pacientes virtuais, anatomia 3D e tomada de decisão médica.',
    platforms: [
      {
        name: 'Body Interact',
        category: 'Simulação Clínica IA',
        model: 'Freemium',
        modelType: 'freemium',
        description: 'Pacientes virtuais inteligentes para prática clínica, emergência médica e tomada de decisão em saúde.',
        url: 'https://bodyinteract.com/',
        icon: '🫀'
      },
      {
        name: 'BioDigital Human',
        category: 'Anatomia 3D',
        model: 'Grátis',
        modelType: 'free',
        description: 'Plataforma interativa de anatomia humana 3D com órgãos, músculos, doenças e sistemas corporais.',
        url: 'https://human.biodigital.com/',
        icon: '🧬'
      },
      {
        name: 'Complete Anatomy',
        category: 'Anatomia Avançada',
        model: 'Freemium',
        modelType: 'freemium',
        description: 'Plataforma profissional de anatomia 3D utilizada por universidades e instituições médicas.',
        url: 'https://3d4medical.com/',
        icon: '🫁'
      }
    ]
  },
  {
    id: 'labs',
    title: '🧬 Laboratórios Científicos',
    description: 'Simulações virtuais para experiências científicas, biologia, química, física e investigação.',
    platforms: [
      {
        name: 'Labster',
        category: 'Laboratórios Virtuais',
        model: 'Freemium',
        modelType: 'freemium',
        description: 'Simulações imersivas de biologia, química, microbiologia e ciências laboratoriais.',
        url: 'https://www.labster.com/',
        icon: '🧪'
      },
      {
        name: 'OpenSim',
        category: 'Biomecânica',
        model: 'Open Source',
        modelType: 'opensource',
        description: 'Plataforma científica para análise de movimento humano, fisioterapia e biomecânica.',
        url: 'https://simtk.org/projects/opensim',
        icon: '⚙️'
      }
    ]
  },
  {
    id: 'ai-vr',
    title: '🤖 Inteligência Artificial e VR',
    description: 'Plataformas de realidade virtual, IA educacional e ambientes imersivos.',
    platforms: [
      {
        name: 'Unity Learn',
        category: 'Desenvolvimento 3D',
        model: 'Grátis',
        modelType: 'free',
        description: 'Plataforma para criação de ambientes virtuais, VR, jogos educativos e simulações.',
        url: 'https://learn.unity.com/',
        icon: '🎮'
      },
      {
        name: 'Engage VR',
        category: 'Campus Virtual',
        model: 'Freemium',
        modelType: 'freemium',
        description: 'Ambientes imersivos e salas virtuais para aprendizagem colaborativa.',
        url: 'https://engagevr.io/',
        icon: '🥽'
      },
      {
        name: 'Inworld AI',
        category: 'Personagens IA',
        model: 'Freemium',
        modelType: 'freemium',
        description: 'Criação de pacientes virtuais, professores IA e personagens inteligentes.',
        url: 'https://inworld.ai/',
        icon: '🤖'
      }
    ]
  }
];

export default function LaboratorioVirtual() {
  return (
    <>
      <style>{`
        .lab-header {
          background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
          color: #fff;
          padding: 2.5rem 1.75rem;
          border-radius: var(--radius, 12px);
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
          position: relative;
          overflow: hidden;
        }

        .lab-header::after {
          content: '';
          position: absolute;
          right: -30px;
          bottom: -30px;
          width: 160px;
          height: 160px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          pointer-events: none;
        }

        .lab-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .lab-header h1 {
          font-size: 1.85rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          line-height: 1.3;
        }

        .lab-header p {
          margin: 0;
          opacity: 0.92;
          font-size: 1rem;
          max-width: 820px;
          line-height: 1.6;
        }

        .category-section {
          margin-bottom: 2.5rem;
        }

        .category-header {
          margin-bottom: 1.25rem;
          padding-bottom: 0.6rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .category-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-dark, #1e293b);
          margin: 0 0 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .category-desc {
          margin: 0;
          color: var(--text-muted, #64748b);
          font-size: 0.92rem;
        }

        .platforms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .platform-card {
          background: var(--white, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius, 12px);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.06));
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
        }

        .platform-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
          border-color: #cbd5e1;
        }

        .platform-card-top {
          margin-bottom: 1rem;
        }

        .platform-title-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .platform-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        .platform-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-dark, #1e293b);
          margin: 0;
          line-height: 1.3;
        }

        .badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.35rem;
        }

        .badge-tag {
          display: inline-block;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .badge-category {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .badge-model-free {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .badge-model-freemium {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .badge-model-opensource {
          background: #ede9fe;
          color: #5b21b6;
          border: 1px solid #ddd6fe;
        }

        .platform-description {
          color: #475569;
          font-size: 0.895rem;
          line-height: 1.55;
          margin: 0 0 1.25rem;
        }

        .platform-btn-green {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
          box-sizing: border-box;
          border: none;
        }

        .platform-btn-green:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
        }

        .platform-btn-green:focus {
          outline: 3px solid rgba(16, 185, 129, 0.4);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .lab-header {
            padding: 1.75rem 1.25rem;
            margin-bottom: 1.5rem;
          }
          .lab-header h1 {
            font-size: 1.45rem;
          }
          .lab-header p {
            font-size: 0.92rem;
          }
          .category-title {
            font-size: 1.15rem;
          }
          .platforms-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>

      <div className="container">
        {/* Header do Módulo */}
        <div className="lab-header">
          <div className="lab-badge-top">
            <span>🔬</span> Extensão & Investigação ISPOTEC
          </div>
          <h1>Laboratório Virtual ISPOTEC</h1>
          <p>
            Explore plataformas modernas de aprendizagem imersiva, inteligência artificial, realidade virtual, simulações médicas, laboratórios científicos e ambientes colaborativos.
          </p>
        </div>

        {/* Categorias e Plataformas */}
        {categories.map((cat) => (
          <section key={cat.id} className="category-section">
            <div className="category-header">
              <h2 className="category-title">{cat.title}</h2>
              <p className="category-desc">{cat.description}</p>
            </div>

            <div className="platforms-grid">
              {cat.platforms.map((p) => {
                const modelBadgeClass =
                  p.modelType === 'free'
                    ? 'badge-model-free'
                    : p.modelType === 'freemium'
                    ? 'badge-model-freemium'
                    : 'badge-model-opensource';

                return (
                  <div key={p.name} className="platform-card">
                    <div className="platform-card-top">
                      <div className="platform-title-row">
                        <div className="platform-icon">{p.icon}</div>
                        <div>
                          <h3 className="platform-name">{p.name}</h3>
                          <div className="badges-row">
                            <span className="badge-tag badge-category">{p.category}</span>
                            <span className={`badge-tag ${modelBadgeClass}`}>{p.model}</span>
                          </div>
                        </div>
                      </div>

                      <p className="platform-description">{p.description}</p>
                    </div>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="platform-btn-green"
                    >
                      🌐 Aceder Plataforma →
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
