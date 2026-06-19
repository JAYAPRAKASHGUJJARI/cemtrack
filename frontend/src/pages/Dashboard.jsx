import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const sections = ['kiln', 'raw_mill', 'cement_mill', 'production'];

const sectionLabels = {
  kiln: '🔥 Kiln Section',
  raw_mill: '⚙️ Raw Mill Section',
  cement_mill: '🏭 Cement Mill Section',
  production: '📦 Production KPIs',
};

const sectionColors = {
  kiln: '#f97316',
  raw_mill: '#3b82f6',
  cement_mill: '#8b5cf6',
  production: '#10b981',
};

const parameterConfig = {
  burning_zone_temp:       { display: 'Burning Zone Temp',       unit: '°C',      min: 1400, max: 1500, section: 'kiln' },
  kiln_inlet_temp:         { display: 'Kiln Inlet Temp',         unit: '°C',      min: 900,  max: 1100, section: 'kiln' },
  kiln_speed:              { display: 'Kiln Speed',              unit: 'RPM',     min: 3.0,  max: 4.5,  section: 'kiln' },
  kiln_feed_rate:          { display: 'Kiln Feed Rate',          unit: 'T/hr',    min: 150,  max: 200,  section: 'kiln' },
  coal_feed_rate:          { display: 'Coal Feed Rate',          unit: 'T/hr',    min: 15,   max: 25,   section: 'kiln' },
  raw_mill_feed_rate:      { display: 'Raw Mill Feed Rate',      unit: 'T/hr',    min: 200,  max: 250,  section: 'raw_mill' },
  raw_mill_outlet_temp:    { display: 'Raw Mill Outlet Temp',    unit: '°C',      min: 80,   max: 95,   section: 'raw_mill' },
  raw_mill_power:          { display: 'Raw Mill Power',          unit: 'kWh/T',   min: 15,   max: 18,   section: 'raw_mill' },
  raw_mill_speed:          { display: 'Raw Mill Speed',          unit: 'RPM',     min: 14,   max: 16,   section: 'raw_mill' },
  cement_mill_feed_rate:   { display: 'Cement Mill Feed Rate',   unit: 'T/hr',    min: 150,  max: 180,  section: 'cement_mill' },
  cement_mill_power:       { display: 'Cement Mill Power',       unit: 'kWh/T',   min: 28,   max: 35,   section: 'cement_mill' },
  cement_mill_outlet_temp: { display: 'Cement Mill Outlet Temp', unit: '°C',      min: 100,  max: 120,  section: 'cement_mill' },
  cement_fineness:         { display: 'Cement Fineness',         unit: 'cm²/g',   min: 3200, max: 3500, section: 'cement_mill' },
  clinker_production:      { display: 'Clinker Production',      unit: 'T/day',   min: 2800, max: 3200, section: 'production' },
  cement_production:       { display: 'Cement Production',       unit: 'T/day',   min: 3300, max: 3700, section: 'production' },
  heat_consumption:        { display: 'Heat Consumption',        unit: 'kcal/kg', min: 750,  max: 850,  section: 'production' },
  equipment_availability:  { display: 'Equipment Availability',  unit: '%',       min: 90,   max: 100,  section: 'production' },
};

const getStatus = (paramName, value) => {
  const config = parameterConfig[paramName];
  if (!config) return 'normal';
  if (value < config.min || value > config.max) return 'critical';
  const range = config.max - config.min;
  const warningBuffer = range * 0.1;
  if (value < config.min + warningBuffer || value > config.max - warningBuffer) return 'warning';
  return 'normal';
};

const statusColors = {
  normal:   { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80',  dot: '#22c55e' },
  warning:  { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.3)',  text: '#facc15',  dot: '#eab308' },
  critical: { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#f87171',  dot: '#ef4444' },
};

const ParameterCard = ({ paramName, value }) => {
  const config = parameterConfig[paramName];
  if (!config) return null;
  const status = getStatus(paramName, value);
  const colors = statusColors[status];

  const fillPercent = Math.min(100, Math.max(0,
    ((value - config.min) / (config.max - config.min)) * 100
  ));

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '16px',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: colors.dot,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }}>
          {config.display}
        </span>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: colors.dot,
          boxShadow: `0 0 6px ${colors.dot}`,
          flexShrink: 0,
          marginLeft: '8px',
          marginTop: '2px',
        }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <span style={{
          color: colors.text,
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}>
          {value !== null ? Number(value).toFixed(1) : '—'}
        </span>
        <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '6px' }}>
          {config.unit}
        </span>
      </div>
      <div style={{
        height: '4px', background: 'rgba(255,255,255,0.05)',
        borderRadius: '2px', overflow: 'hidden', marginBottom: '8px',
      }}>
        <div style={{
          height: '100%', width: `${fillPercent}%`,
          background: colors.dot,
          borderRadius: '2px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#475569', fontSize: '10px' }}>{config.min}</span>
        <span style={{ color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status}</span>
        <span style={{ color: '#475569', fontSize: '10px' }}>{config.max}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ ALL useState AT TOP
  const [readings, setReadings] = useState({});
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [lastTick, setLastTick] = useState(null);
  const [connected, setConnected] = useState(false);

  // ✅ fetchActiveAlerts uses /alerts/stats so Dashboard and Alerts page show same numbers
  const fetchActiveAlerts = async () => {
    try {
      const res = await API.get('/alerts/stats');
      setActiveAlerts(res.data.data.unacknowledged);
      setCriticalCount(res.data.data.critical);
      setWarningCount(res.data.data.warning);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await API.get('/readings/latest');
        const map = {};
        res.data.data.forEach(r => { map[r.parameter_name] = r.value; });
        setReadings(map);
      } catch (err) {
        console.error('Failed to fetch latest readings:', err);
      }
    };
    fetchLatest();
    fetchActiveAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    setConnected(true);

    socket.off('new-reading');
    socket.off('new-alert');
    socket.off('alert-acknowledged');

    socket.on('new-reading', (data) => {
      setReadings(prev => ({
        ...prev,
        [data.parameter_name]: data.value,
      }));
      setLastTick(new Date());
    });

    socket.on('new-alert', () => {
      fetchActiveAlerts();
    });

    socket.on('alert-acknowledged', () => {
      fetchActiveAlerts();
    });

    return () => {
      socket.off('new-reading');
      socket.off('new-alert');
      socket.off('alert-acknowledged');
    };
  }, [socket]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
          Live Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Welcome back, {user?.name} · Real-time plant monitoring
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {/* Connection */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>CONNECTION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: connected ? '#22c55e' : '#ef4444',
              boxShadow: connected ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
            }} />
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          {lastTick && (
            <div style={{ color: '#475569', fontSize: '11px', marginTop: '4px' }}>
              Last update: {lastTick.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => navigate('/alerts')}
          style={{
            background: activeAlerts > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
            border: activeAlerts > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>ACTIVE ALERTS 👆</div>
          <div style={{ color: activeAlerts > 0 ? '#f87171' : '#4ade80', fontSize: '28px', fontWeight: 'bold' }}>
            {activeAlerts}
          </div>
        </div>

        {/* Critical */}
        <div
          onClick={() => navigate('/alerts')}
          style={{
            background: criticalCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
            border: criticalCount > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>CRITICAL 👆</div>
          <div style={{ color: criticalCount > 0 ? '#f87171' : '#4ade80', fontSize: '28px', fontWeight: 'bold' }}>
            {criticalCount}
          </div>
        </div>

        {/* Warning */}
        <div
          onClick={() => navigate('/alerts')}
          style={{
            background: warningCount > 0 ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
            border: warningCount > 0 ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>WARNING 👆</div>
          <div style={{ color: warningCount > 0 ? '#facc15' : '#4ade80', fontSize: '28px', fontWeight: 'bold' }}>
            {warningCount}
          </div>
        </div>
      </div>

      {/* Parameter Sections */}
      {sections.map(section => {
        const sectionParams = Object.entries(parameterConfig)
          .filter(([, config]) => config.section === section);

        return (
          <div key={section} style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '4px', height: '24px',
                background: sectionColors[section],
                borderRadius: '2px',
              }} />
              <h2 style={{
                color: 'white', fontSize: '16px',
                fontWeight: '600', margin: 0,
              }}>
                {sectionLabels[section]}
              </h2>
              <div style={{
                height: '1px', flex: 1,
                background: 'rgba(255,255,255,0.06)',
              }} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {sectionParams.map(([paramName]) => (
                <ParameterCard
                  key={paramName}
                  paramName={paramName}
                  value={readings[paramName] ?? null}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;