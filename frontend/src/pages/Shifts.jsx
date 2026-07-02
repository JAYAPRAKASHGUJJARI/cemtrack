import { useState, useEffect } from 'react';
import API from '../api/axios';

const shiftColors = {
  morning:   { bg: 'rgba(250,204,21,0.1)', color: '#facc15', border: 'rgba(250,204,21,0.3)', icon: '🌅' },
  afternoon: { bg: 'rgba(249,115,22,0.1)', color: '#fb923c', border: 'rgba(249,115,22,0.3)', icon: '☀️' },
  night:     { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.3)', icon: '🌙' },
};

const formatIST = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const getDuration = (start, end) => {
  if (!end) return 'Ongoing';
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

const Shifts = () => {
  const [activeShifts, setActiveShifts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        API.get('/shifts/active-all'),
        API.get('/shifts/history?limit=30'),
      ]);
      setActiveShifts(activeRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
          🕐 Shifts
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Active and past operator shifts
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
          Loading shifts...
        </div>
      ) : (
        <>
          {/* Active Shifts */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
              🟢 Currently Active ({activeShifts.length})
            </h2>
            {activeShifts.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                color: '#64748b',
              }}>
                No operators currently on shift
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {activeShifts.map(shift => {
                  const colors = shiftColors[shift.shift_name] || shiftColors.morning;
                  return (
                    <div key={shift.id} style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '18px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{colors.icon}</span>
                        <span style={{ color: colors.color, fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {shift.shift_name} Shift
                        </span>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#22c55e', marginLeft: 'auto',
                          boxShadow: '0 0 6px #22c55e',
                        }} />
                      </div>
                      <div style={{ color: 'white', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
                        👤 {shift.operator_name}
                        <span style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: '#cbd5e1', fontSize: '10px',
                          padding: '1px 6px', borderRadius: '4px',
                          marginLeft: '8px', textTransform: 'uppercase',
                        }}>
                          {shift.operator_role}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        Started {formatIST(shift.start_time)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shift History */}
          <div>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
              📋 Shift History
            </h2>
            {history.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                color: '#64748b',
              }}>
                No completed shifts yet
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.5fr 1.5fr 1.5fr 1fr 2fr',
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {['SHIFT', 'OPERATOR', 'START', 'END', 'DURATION', 'NOTES'].map(h => (
                    <div key={h} style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>{h}</div>
                  ))}
                </div>

                {/* Table Rows */}
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {history.map(shift => {
                    const colors = shiftColors[shift.shift_name] || shiftColors.morning;
                    return (
                      <div key={shift.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1.5fr 1.5fr 1.5fr 1fr 2fr',
                        padding: '14px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        alignItems: 'center',
                      }}>
                        <div>
                          <span style={{
                            background: colors.bg, color: colors.color,
                            border: `1px solid ${colors.border}`,
                            padding: '3px 10px', borderRadius: '6px',
                            fontSize: '11px', fontWeight: '600', textTransform: 'capitalize',
                          }}>
                            {colors.icon} {shift.shift_name}
                          </span>
                        </div>
                        <div style={{ color: 'white', fontSize: '13px' }}>
                          {shift.operator_name}
                          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>
                            {shift.operator_role}
                          </div>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{formatIST(shift.start_time)}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{formatIST(shift.end_time)}</div>
                        <div style={{ color: '#fb923c', fontSize: '12px', fontWeight: '600' }}>
                          {getDuration(shift.start_time, shift.end_time)}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                          {shift.notes || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Shifts;