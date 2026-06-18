import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import { useSocket } from '../context/SocketContext';

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

const sectionColors = {
  kiln: '#f97316',
  raw_mill: '#3b82f6',
  cement_mill: '#8b5cf6',
  production: '#10b981',
};

const sections = {
  kiln: '🔥 Kiln',
  raw_mill: '⚙️ Raw Mill',
  cement_mill: '🏭 Cement Mill',
  production: '📦 Production',
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px' }}>{label}</p>
        <p style={{ color: '#f97316', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
          {Number(payload[0].value).toFixed(2)} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const Parameters = () => {
  const { socket } = useSocket();
  const [selected, setSelected] = useState('burning_zone_temp');
  const [hours, setHours] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ min: null, max: null, avg: null, current: null });

  const config = parameterConfig[selected];
  const color = sectionColors[config.section];

  // Fetch trend data
  const fetchTrend = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/readings/trend?parameter=${selected}&hours=${hours}`);
      const data = res.data.data.map(r => ({
        time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(r.value),
      }));
      setChartData(data);

      if (data.length > 0) {
        const values = data.map(d => d.value);
        setStats({
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
          current: values[values.length - 1].toFixed(2),
        });
      }
    } catch (err) {
      console.error('Failed to fetch trend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrend();
  }, [selected, hours]);

  // Live update via socket
  useEffect(() => {
    if (!socket) return;
    socket.on('new-reading', (data) => {
      if (data.parameter_name === selected) {
        const newPoint = {
          time: new Date(data.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: parseFloat(data.value),
        };
        setChartData(prev => {
          const updated = [...prev, newPoint].slice(-100);
          const values = updated.map(d => d.value);
          setStats({
            min: Math.min(...values).toFixed(2),
            max: Math.max(...values).toFixed(2),
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
            current: newPoint.value.toFixed(2),
          });
          return updated;
        });
      }
    });
    return () => socket.off('new-reading');
  }, [socket, selected]);

  const getStatusColor = (value) => {
    if (!value) return '#94a3b8';
    const v = parseFloat(value);
    if (v < config.min || v > config.max) return '#f87171';
    const range = config.max - config.min;
    if (v < config.min + range * 0.1 || v > config.max - range * 0.1) return '#facc15';
    return '#4ade80';
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
          Parameters
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Historical trends and analysis for all 17 parameters
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap',
      }}>
        {/* Parameter selector grouped by section */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            SELECT PARAMETER
          </label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Object.entries(sections).map(([sectionKey, sectionLabel]) => (
              <optgroup key={sectionKey} label={sectionLabel}>
                {Object.entries(parameterConfig)
                  .filter(([, c]) => c.section === sectionKey)
                  .map(([key, c]) => (
                    <option key={key} value={key} style={{ background: '#1e293b' }}>
                      {c.display}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Time range */}
        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            TIME RANGE
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 6, 12, 24].map(h => (
              <button
                key={h}
                onClick={() => setHours(h)}
                style={{
                  padding: '10px 16px',
                  background: hours === h ? color : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${hours === h ? color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: hours === h ? 'white' : '#94a3b8',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: hours === h ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                }}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '24px',
      }}>
        {[
          { label: 'CURRENT', value: stats.current, highlight: true },
          { label: 'AVERAGE', value: stats.avg },
          { label: 'MINIMUM', value: stats.min },
          { label: 'MAXIMUM', value: stats.max },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${highlight ? color + '55' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{label}</div>
            <div style={{
              color: highlight ? getStatusColor(value) : 'white',
              fontSize: '22px', fontWeight: 'bold', fontFamily: 'monospace',
            }}>
              {value ?? '—'}
            </div>
            <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>{config.unit}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        {/* Chart header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>
              {config.display}
            </h2>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
              Safe range: {config.min} – {config.max} {config.unit}
            </p>
          </div>
          <div style={{
            background: `${color}22`,
            border: `1px solid ${color}55`,
            borderRadius: '8px',
            padding: '6px 14px',
            color: color,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {sections[config.section]}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
            No data available for this time range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="time"
                stroke="#475569"
                tick={{ fill: '#475569', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: '#475569', fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip unit={config.unit} />} />
              {/* Safe range reference lines */}
              <ReferenceLine y={config.min} stroke="#ef444466" strokeDasharray="4 4" label={{ value: 'Min', fill: '#ef4444', fontSize: 11 }} />
              <ReferenceLine y={config.max} stroke="#ef444466" strokeDasharray="4 4" label={{ value: 'Max', fill: '#ef4444', fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Safe Range Info */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex', gap: '32px', flexWrap: 'wrap',
      }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '12px' }}>SAFE MIN </span>
          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{config.min} {config.unit}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '12px' }}>SAFE MAX </span>
          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{config.max} {config.unit}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '12px' }}>DATA POINTS </span>
          <span style={{ color: 'white', fontWeight: 'bold' }}>{chartData.length}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '12px' }}>UPDATE INTERVAL </span>
          <span style={{ color: 'white', fontWeight: 'bold' }}>5 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default Parameters;