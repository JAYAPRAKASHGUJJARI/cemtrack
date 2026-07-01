import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First login to get token
      const loginRes = await API.post('/auth/login', { email, password: oldPassword });
      const token = loginRes.data.token;

      // Then change password using that token
      await API.patch('/auth/change-password', {
        oldPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Password changed successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px',
          }}>🔑</div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Change Password
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
            Enter your credentials to update password
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px', padding: '12px', marginBottom: '16px',
            color: '#4ade80', fontSize: '14px',
          }}>
            ✅ {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '12px', marginBottom: '16px',
            color: '#f87171', fontSize: '14px',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Email</label>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='your@email.com'
            style={{
              width: '100%', padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Current Password */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Current Password</label>
          <input
            type='password'
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder='••••••••'
            style={{
              width: '100%', padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* New Password */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>New Password</label>
          <input
            type='password'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder='••••••••'
            style={{
              width: '100%', padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
          <input
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder='••••••••'
            style={{
              width: '100%', padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: loading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, #f97316, #ea580c)',
            border: 'none', borderRadius: '8px',
            color: 'white', fontSize: '16px',
            fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Changing...' : '🔑 Change Password'}
        </button>

        {/* Back to Login */}
        <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: 0 }}>
          <span
            onClick={() => navigate('/login')}
            style={{ color: '#fb923c', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;