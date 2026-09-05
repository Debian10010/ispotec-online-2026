import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/?logout=1', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>A terminar sessão...</p>
    </div>
  );
}
