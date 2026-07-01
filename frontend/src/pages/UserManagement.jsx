import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'operator' });
const [addLoading, setAddLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const showError = (err) => {
    setError(err);
    setTimeout(() => setError(null), 3000);
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.patch(`/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      showMessage(`Role updated to ${role}`);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleStatusChange = async (id, is_active) => {
    try {
      await API.patch(`/users/${id}/status`, { is_active });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active } : u));
      showMessage(`User ${is_active ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      showMessage('User deleted successfully');
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) { showError('Please enter a new password'); return; }
    if (newPassword.length < 6) { showError('Password must be at least 6 characters'); return; }
    try {
      await API.patch(`/users/${resetPasswordModal.id}/reset-password`, { newPassword });
      showMessage(`Password reset for ${resetPasswordModal.name}`);
      setResetPasswordModal(null);
      setNewPassword('');
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleAddUser = async () => {
  if (!newUser.name || !newUser.email || !newUser.password) {
    showError('Please fill in all fields');
    return;
  }
  if (newUser.password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  setAddLoading(true);
  try {
    await API.post('/auth/register', {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
    });
    // Change role if not operator
    if (newUser.role !== 'operator') {
      const res = await API.get('/users');
      const created = res.data.data.find(u => u.email === newUser.email);
      if (created) {
        await API.patch(`/users/${created.id}/role`, { role: newUser.role });
      }
    }
    showMessage(`User ${newUser.name} created successfully!`);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', password: '', role: 'operator' });
    fetchUsers();
  } catch (err) {
    showError(err.response?.data?.error || 'Failed to create user');
  } finally {
    setAddLoading(false);
  }
};
  const roleBadge = {
    admin:    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  border: 'rgba(239,68,68,0.3)' },
    manager:  { bg: 'rgba(249,115,22,0.15)',  color: '#fb923c',  border: 'rgba(249,115,22,0.3)' },
    operator: { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: 'rgba(34,197,94,0.3)' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  <div>
    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
      👥 User Management
    </h1>
    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
      Manage user accounts, roles and permissions
    </p>
  </div>
  <button
    onClick={() => setShowAddModal(true)}
    style={{
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #f97316, #ea580c)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
    }}
  >
    + Add User
  </button>
</div>

      {/* Message / Error */}
      {message && (
        <div style={{
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
          color: '#4ade80', fontSize: '14px',
        }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
          color: '#f87171', fontSize: '14px',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '24px',
      }}>
        {[
          { label: 'TOTAL USERS', value: users.length, color: 'white' },
          { label: 'ADMINS', value: users.filter(u => u.role === 'admin').length, color: '#f87171' },
          { label: 'MANAGERS', value: users.filter(u => u.role === 'manager').length, color: '#fb923c' },
          { label: 'OPERATORS', value: users.filter(u => u.role === 'operator').length, color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{label}</div>
            <div style={{ color, fontSize: '28px', fontWeight: 'bold' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
          Loading users...
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2fr',
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {['NAME', 'EMAIL', 'ROLE', 'STATUS', 'JOINED', 'ACTIONS'].map(h => (
              <div key={h} style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {users.map(u => {
            const badge = roleBadge[u.role] || roleBadge.operator;
            const isCurrentUser = u.id === currentUser.id;
            return (
              <div key={u.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2fr',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
                background: isCurrentUser ? 'rgba(249,115,22,0.03)' : 'transparent',
              }}>
                {/* Name */}
                <div>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                    {u.name} {isCurrentUser && <span style={{ color: '#fb923c', fontSize: '11px' }}>(you)</span>}
                  </div>
                </div>

                {/* Email */}
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>{u.email}</div>

                {/* Role */}
                <div>
                  {isCurrentUser ? (
                    <span style={{
                      background: badge.bg, color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 10px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: '600', textTransform: 'uppercase',
                    }}>
                      {u.role}
                    </span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none',
                        textTransform: 'uppercase',
                      }}
                    >
                      <option value="operator" style={{ background: '#1e293b' }}>OPERATOR</option>
                      <option value="manager" style={{ background: '#1e293b' }}>MANAGER</option>
                      <option value="admin" style={{ background: '#1e293b' }}>ADMIN</option>
                    </select>
                  )}
                </div>

                {/* Status */}
                <div>
                  {isCurrentUser ? (
                    <span style={{ color: '#4ade80', fontSize: '13px' }}>● Active</span>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(u.id, !u.is_active)}
                      style={{
                        background: u.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${u.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        borderRadius: '6px',
                        color: u.is_active ? '#4ade80' : '#f87171',
                        padding: '4px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {u.is_active ? '● Active' : '○ Disabled'}
                    </button>
                  )}
                </div>

                {/* Joined */}
                <div style={{ color: '#475569', fontSize: '12px' }}>
                  {new Date(u.created_at).toLocaleDateString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isCurrentUser && (
                    <>
                      <button
                        onClick={() => { setResetPasswordModal(u); setNewPassword(''); }}
                        style={{
                          background: 'rgba(249,115,22,0.1)',
                          border: '1px solid rgba(249,115,22,0.2)',
                          borderRadius: '6px', color: '#fb923c',
                          padding: '6px 10px', fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        🔑 Reset
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '6px', color: '#f87171',
                          padding: '6px 10px', fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '400px',
          }}>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
              🔑 Reset Password
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>
              Reset password for <strong style={{ color: '#fb923c' }}>{resetPasswordModal.name}</strong>
            </p>

            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              NEW PASSWORD
            </label>
            <input
              type='password'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder='Min 6 characters'
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: 'white',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleResetPassword}
                style={{
                  flex: 1, padding: '12px',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none', borderRadius: '8px',
                  color: 'white', fontSize: '14px',
                  fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                Reset Password
              </button>
              <button
                onClick={() => { setResetPasswordModal(null); setNewPassword(''); }}
                style={{
                  flex: 1, padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#94a3b8',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
          
      )}
      {/* Add User Modal */}
{showAddModal && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', padding: '32px',
      width: '100%', maxWidth: '420px',
    }}>
      <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px' }}>
        👤 Add New User
      </h3>

      {/* Name */}
      <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>NAME</label>
      <input
        type='text'
        value={newUser.name}
        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
        placeholder='Full name'
        style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: 'white',
          fontSize: '14px', outline: 'none',
          boxSizing: 'border-box', marginBottom: '16px',
        }}
      />

      {/* Email */}
      <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>EMAIL</label>
      <input
        type='email'
        value={newUser.email}
        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
        placeholder='email@cemtrack.com'
        style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: 'white',
          fontSize: '14px', outline: 'none',
          boxSizing: 'border-box', marginBottom: '16px',
        }}
      />

      {/* Password */}
      <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
      <input
        type='password'
        value={newUser.password}
        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
        placeholder='Min 6 characters'
        style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: 'white',
          fontSize: '14px', outline: 'none',
          boxSizing: 'border-box', marginBottom: '16px',
        }}
      />

      {/* Role */}
      <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>ROLE</label>
      <select
        value={newUser.role}
        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: 'white',
          fontSize: '14px', outline: 'none',
          boxSizing: 'border-box', marginBottom: '24px',
          cursor: 'pointer',
        }}
      >
        <option value="operator" style={{ background: '#1e293b' }}>Operator</option>
        <option value="manager" style={{ background: '#1e293b' }}>Manager</option>
        <option value="admin" style={{ background: '#1e293b' }}>Admin</option>
      </select>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleAddUser}
          disabled={addLoading}
          style={{
            flex: 1, padding: '12px',
            background: addLoading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, #f97316, #ea580c)',
            border: 'none', borderRadius: '8px',
            color: 'white', fontSize: '14px',
            fontWeight: 'bold', cursor: addLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {addLoading ? '⏳ Creating...' : '✅ Create User'}
        </button>
        <button
          onClick={() => { setShowAddModal(false); setNewUser({ name: '', email: '', password: '', role: 'operator' }); }}
          style={{
            flex: 1, padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: '#94a3b8',
            fontSize: '14px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default UserManagement;