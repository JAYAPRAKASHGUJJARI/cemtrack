import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

 const parameterDisplayNames = {
  burning_zone_temp:       'Burning Zone Temp',
  kiln_inlet_temp:         'Kiln Inlet Temp',
  kiln_speed:              'Kiln Speed',
  kiln_feed_rate:          'Kiln Feed Rate',
  coal_feed_rate:          'Coal Feed Rate',
  raw_mill_feed_rate:      'Raw Mill Feed Rate',
  raw_mill_outlet_temp:    'Raw Mill Outlet Temp',
  raw_mill_power:          'Raw Mill Power',
  raw_mill_speed:          'Raw Mill Speed',
  cement_mill_feed_rate:   'Cement Mill Feed Rate',
  cement_mill_power:       'Cement Mill Power',
  cement_mill_outlet_temp: 'Cement Mill Outlet Temp',
  cement_fineness:         'Cement Fineness',
  clinker_production:      'Clinker Production',
  cement_production:       'Cement Production',
  heat_consumption:        'Heat Consumption',
  equipment_availability:  'Equipment Availability',
};

const Alerts = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0, unacknowledged: 0 });
  const [filter, setFilter] = useState('all'); // all / critical / warning / unacknowledged
  const [loading, setLoading] = useState(true);

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const res = await API.get('/alerts');
      setAlerts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await API.get('/alerts/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, []);

  // Socket live updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      setStats(prev => ({
        ...prev,
        total: parseInt(prev.total) + 1,
        unacknowledged: parseInt(prev.unacknowledged) + 1,
        ...(alert.status === 'critical' ? { critical: parseInt(prev.critical) + 1 } : {}),
        ...(alert.status === 'warning' ? { warning: parseInt(prev.warning) + 1 } : {}),
      }));
    });

    socket.on('alert-acknowledged', ({ alertId }) => {
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
      );
      setStats(prev => ({
        ...prev,
        unacknowledged: Math.max(0, parseInt(prev.unacknowledged) - 1),
      }));
    });

    return () => {
      socket.off('new-alert');
      socket.off('alert-acknowledged');
    };
  }, [socket]);

  // Acknowledge alert
  const handleAcknowledge = async (id) => {
    try {
      await API.patch(`/alerts/${id}/acknowledge`);
      // Broadcast via socket to all clients
      socket.emit('acknowledge-alert', { alertId: id, userId: user.id });
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  // Delete alert
  const handleDelete = async (id) => {
    try {
      await API.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      fetchStats();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'critical') return alert.status === 'critical';
    if (filter === 'warning') return alert.status === 'warning';
    if (filter === 'unacknowledged') return !alert.acknowledged;
    return true;
  });
const timeAgo = (dateStr) => {
  const past = new Date(dateStr); // UTC from DB
  const now = new Date(); // local time (IST on your Mac)
  
  // now is IST, past is UTC — need to convert now to UTC
  const nowUTC = new Date(now.getTime() - (5.5 * 60 * 60 * 1000));
  const diff = Math.floor((nowUTC - past) / 1000);

  // Add 5.5 hours to past for IST display
  const istTime = new Date(past.getTime() + (5.5 * 60 * 60 * 1000));
  const dateFormatted = istTime.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (diff < 0) return `Just now · ${dateFormatted}`;
  if (diff < 60) return `${diff}s ago · ${dateFormatted}`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago · ${dateFormatted}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago · ${dateFormatted}`;
  return `${Math.floor(diff / 86400)}d ago · ${dateFormatted}`;
};

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
          Alerts
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Real-time plant alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '24px',
      }}>
        {[
          { label: 'TOTAL (24hr)', value: stats.total, color: 'white' },
          { label: 'CRITICAL', value: stats.critical, color: '#f87171' },
          { label: 'WARNING', value: stats.warning, color: '#facc15' },
          { label: 'UNACKNOWLEDGED', value: stats.unacknowledged, color: '#fb923c' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{label}</div>
            <div style={{ color, fontSize: '28px', fontWeight: 'bold' }}>{value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: '📋 All' },
          { key: 'unacknowledged', label: '🔔 Unacknowledged' },
          { key: 'critical', label: '🔴 Critical' },
          { key: 'warning', label: '🟡 Warning' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '8px 16px',
              background: filter === key ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === key ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              color: filter === key ? '#fb923c' : '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', color: '#475569', fontSize: '13px', alignSelf: 'center' }}>
          Showing {filteredAlerts.length} alerts
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
          Loading alerts...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div style={{
          textAlign: 'center', color: '#64748b', padding: '60px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '18px', color: '#4ade80' }}>No alerts found</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>Plant is running normally</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAlerts.map(alert => {
            const isCritical = alert.status === 'critical';
            const borderColor = isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)';
            const bgColor = isCritical ? 'rgba(239,68,68,0.05)' : 'rgba(234,179,8,0.05)';
            const badgeColor = isCritical ? '#f87171' : '#facc15';
            const dotColor = isCritical ? '#ef4444' : '#eab308';

            return (
              <div key={alert.id} style={{
                background: alert.acknowledged ? 'rgba(255,255,255,0.02)' : bgColor,
                border: `1px solid ${alert.acknowledged ? 'rgba(255,255,255,0.06)' : borderColor}`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                opacity: alert.acknowledged ? 0.6 : 1,
                transition: 'all 0.3s',
              }}>
                {/* Status dot */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: alert.acknowledged ? '#475569' : dotColor,
                  boxShadow: alert.acknowledged ? 'none' : `0 0 8px ${dotColor}`,
                  flexShrink: 0,
                }} />

                {/* Alert info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    {/* Status badge */}
                    <span style={{
                      background: `${badgeColor}22`,
                      border: `1px solid ${badgeColor}55`,
                      color: badgeColor,
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {alert.status}
                    </span>
                    {/* Type badge */}
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#64748b',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {alert.type}
                    </span>
                    {alert.acknowledged && (
                      <span style={{
                        background: 'rgba(34,197,94,0.1)',
                        color: '#4ade80',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>

                  <div style={{ color: 'white', fontSize: '14px', marginBottom: '4px' }}>
                    {alert.message}
                  </div>

                  <div style={{ color: '#475569', fontSize: '12px' }}>
  {parameterDisplayNames[alert.parameter_name] || alert.parameter_name} · {timeAgo(alert.created_at)}
</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: '8px',
                        color: '#4ade80',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      ✓ Acknowledge
                    </button>
                  )}
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                      onClick={() => handleDelete(alert.id)}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;