import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CURSOS_IFOPTEC_CATALOGO,
  REQUISITOS_MATRICULA_IFOPTEC,
  POLOS_IFOPTEC
} from '../../services/homeschoolService';

export default function IfoptecCursos() {
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedCurso, setSelectedCurso] = useState(null);

  const cursos = CURSOS_IFOPTEC_CATALOGO.filter(c => {
    if (activeTab === 'todos') return true;
    return c.categoria === activeTab;
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#e0f2fe',
          color: '#0284c7',
          padding: '0.4rem 1rem',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '0.75rem'
        }}>
          Catálogo Oficial IFOPTEC
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Cursos Profissionais e Técnicos
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '700px', margin: '0 auto' }}>
          Conheça a matriz curricular, condições de matrícula e saídas profissionais dos cursos de Saúde e Tecnologias.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('todos')}
          style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
        >
          Todos os Cursos
        </button>
        <button
          className={`btn ${activeTab === 'curta_duracao' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('curta_duracao')}
          style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
        >
          ⏱️ Curta Duração (6 Meses)
        </button>
        <button
          className={`btn ${activeTab === 'tecnico_medio' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('tecnico_medio')}
          style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
        >
          🎓 Técnico Médio (3 Anos)
        </button>
      </div>

      {/* Grid of Courses */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {cursos.map((c) => (
          <div
            key={c.id}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  background: c.categoria === 'curta_duracao' ? '#fef3c7' : '#dbeafe',
                  color: c.categoria === 'curta_duracao' ? '#92400e' : '#1e40af'
                }}>
                  {c.tipo}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '0.2rem 0.6rem', borderRadius: '15px' }}>
                  ⏳ {c.duracao}
                </span>
              </div>

              <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                <span style={{ marginRight: '0.4rem' }}>{c.icone}</span>
                {c.nome}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem' }}>
                {c.descricao}
              </p>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Propina Mensal:</span>
                  <strong style={{ color: '#02529c' }}>{c.mensalidade}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Matrícula:</span>
                  <strong style={{ color: '#059669' }}>{c.matricula}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                  Módulos de Estudo:
                </strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.82rem', color: '#334155' }}>
                  {c.disciplinas.map((d, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <Link
                to="/ifoptec"
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
              >
                📝 Inscrever-se no Polo Matola-Rio ou Marracuene
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
