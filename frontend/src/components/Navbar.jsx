import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard', roles: ['operator', 'manager', 'admin'] },
    { path: '/parameters', label: '📈 Parameters', roles: ['operator', 'manager', 'admin'] },
    { path: '/alerts', label: '🚨 Alerts', roles: ['operator', 'manager', 'admin'] },
    { path: '/manual-entry', label: '✏️ Manual Entry', roles: ['operator', 'manager', 'admin'] },
    { path: '/reports', label: '📋 Reports', roles: ['manager', 'admin'] },
    { path: '/ai-insights', label: '🤖 AI Insights', roles: ['operator','manager', 'admin'] },
    { path: '/user-management', label: '👥 Users', roles: ['admin'] },
    { path: '/shifts', label: '🕐 Shifts', roles: ['operator', 'manager', 'admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  const roleBadgeColor = {
    admin: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    manager: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
    operator: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  };
  const badge = roleBadgeColor[user?.role] || roleBadgeColor.operator;

  return (
    <>
      {/* Top Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        {/* Left — Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🏭</div>
          <span style={{
            color: 'white', fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.5px'
          }}>CemTrack</span>
        </div>

        {/* Center — Nav Links (desktop) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          // Hide on small screens via inline — for full responsive use CSS file
        }}>
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: isActive ? 'rgba(249,115,22,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: isActive ? '#fb923c' : '#94a3b8',
                  padding: '6px 12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.target.style.color = 'white';
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.target.style.color = '#94a3b8';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right — User info + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Role badge */}
          <div style={{
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            color: badge.color,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {user?.role}
          </div>

          {/* User name */}
          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
            👤 {user?.name}
          </span>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: '#f87171',
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(239,68,68,0.1)';
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Spacer so content doesn't hide under navbar */}
      <div style={{ height: '60px' }} />
    </>
  );
};

export default Navbar;