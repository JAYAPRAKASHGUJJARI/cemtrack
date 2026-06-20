import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const parameterConfig = {
  burning_zone_temp:       { display: 'Burning Zone Temp',       unit: '°C',      min: 1400, max: 1500, section: '🔥 Kiln' },
  kiln_inlet_temp:         { display: 'Kiln Inlet Temp',         unit: '°C',      min: 900,  max: 1100, section: '🔥 Kiln' },
  kiln_speed:              { display: 'Kiln Speed',              unit: 'RPM',     min: 3.0,  max: 4.5,  section: '🔥 Kiln' },
  kiln_feed_rate:          { display: 'Kiln Feed Rate',          unit: 'T/hr',    min: 150,  max: 200,  section: '🔥 Kiln' },
  coal_feed_rate:          { display: 'Coal Feed Rate',          unit: 'T/hr',    min: 15,   max: 25,   section: '🔥 Kiln' },
  raw_mill_feed_rate:      { display: 'Raw Mill Feed Rate',      unit: 'T/hr',    min: 200,  max: 250,  section: '⚙️ Raw Mill' },
  raw_mill_outlet_temp:    { display: 'Raw Mill Outlet Temp',    unit: '°C',      min: 80,   max: 95,   section: '⚙️ Raw Mill' },
  raw_mill_power:          { display: 'Raw Mill Power',          unit: 'kWh/T',   min: 15,   max: 18,   section: '⚙️ Raw Mill' },
  raw_mill_speed:          { display: 'Raw Mill Speed',          unit: 'RPM',     min: 14,   max: 16,   section: '⚙️ Raw Mill' },
  cement_mill_feed_rate:   { display: 'Cement Mill Feed Rate',   unit: 'T/hr',    min: 150,  max: 180,  section: '🏭 Cement Mill' },
  cement_mill_power:       { display: 'Cement Mill Power',       unit: 'kWh/T',   min: 28,   max: 35,   section: '🏭 Cement Mill' },
  cement_mill_outlet_temp: { display: 'Cement Mill Outlet Temp', unit: '°C',      min: 100,  max: 120,  section: '🏭 Cement Mill' },
  cement_fineness:         { display: 'Cement Fineness',         unit: 'cm²/g',   min: 3200, max: 3500, section: '🏭 Cement Mill' },
  clinker_production:      { display: 'Clinker Production',      unit: 'T/day',   min: 2800, max: 3200, section: '📦 Production' },
  cement_production:       { display: 'Cement Production',       unit: 'T/day',   min: 3300, max: 3700, section: '📦 Production' },
  heat_consumption:        { display: 'Heat Consumption',        unit: 'kcal/kg', min: 750,  max: 850,  section: '📦 Production' },
  equipment_availability:  { display: 'Equipment Availability',  unit: '%',       min: 90,   max: 100,  section: '📦 Production' },
};

const sections = ['🔥 Kiln', '⚙️ Raw Mill', '🏭 Cement Mill', '📦 Production'];

const statusColor = {
  normal: '#4ade80',
  warning: '#facc15',
  critical: '#f87171',
};

const ManualEntry = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState('burning_zone_temp');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);

  const config = parameterConfig[selected];

  // Fetch recent manual entries on page load
useEffect(() => {
  const fetchRecent = async () => {
    try {
      const res = await API.get(`/readings/history?source=manual&operator_id=${user.id}&limit=50`);
      const entries = res.data.data.map(r => {
        const cfg = parameterConfig[r.parameter_name];
        let status = null;
        if (cfg) {
          const v = parseFloat(r.value);
          if (v < cfg.min || v > cfg.max) status = 'critical';
          else {
            const range = cfg.max - cfg.min;
            if (v < cfg.min + range * 0.1 || v > cfg.max - range * 0.1) status = 'warning';
            else status = 'normal';
          }
        }
        return {
          id: r.id,
          parameter: cfg?.display || r.parameter_name,
          value: parseFloat(r.value),
          unit: r.unit,
          status,
          time: new Date(r.recorded_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          operator_id: r.operator_id,
        };
      });
      setRecentEntries(entries);
    } catch (err) {
      console.error('Failed to fetch recent entries:', err);
    }
  };
  fetchRecent();
}, []);

  const getValueStatus = () => {
    if (!value) return null;
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    if (v < config.min || v > config.max) return 'critical';
    const range = config.max - config.min;
    if (v < config.min + range * 0.1 || v > config.max - range * 0.1) return 'warning';
    return 'normal';
  };

  const valueStatus = getValueStatus();

  const handleSubmit = async () => {
    if (!value) { setError('Please enter a value'); return; }
    const v = parseFloat(value);
    if (isNaN(v)) { setError('Please enter a valid number'); return; }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await API.post('/readings', {
        parameter_name: selected,
        value: v,
        unit: config.unit,
        source: 'manual',
        operator_id: user.id,
      });

      const newEntry = {
        id: res.data.data.id,
        parameter: config.display,
        value: v,
        unit: config.unit,
        status: valueStatus,
       time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        operator_id: user.id,
      };

      setRecentEntries(prev => [newEntry, ...prev]);
      setSuccess(`✅ ${config.display} recorded as ${v} ${config.unit}`);
      setValue('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save reading');
    } finally {
      setLoading(false);
    }
  };

  // Delete entry — only own entries
  const handleDelete = async (id) => {
    try {
      await API.delete(`/readings/${id}`);
      setRecentEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
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
          Manual Entry
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Record sensor readings manually
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1000px' }}>

        {/* Left — Entry Form */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 20px' }}>
            📝 New Reading
          </h2>

          {/* Parameter Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              PARAMETER
            </label>
            <select
              value={selected}
              onChange={e => { setSelected(e.target.value); setValue(''); setSuccess(null); setError(null); }}
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
                boxSizing: 'border-box',
              }}
            >
              {sections.map(section => (
                <optgroup key={section} label={section}>
                  {Object.entries(parameterConfig)
                    .filter(([, c]) => c.section === section)
                    .map(([key, c]) => (
                      <option key={key} value={key} style={{ background: '#1e293b' }}>
                        {c.display}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Safe Range Info */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>SAFE MIN</div>
              <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{config.min}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>UNIT</div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{config.unit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>SAFE MAX</div>
              <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{config.max}</div>
            </div>
          </div>

          {/* Value Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              VALUE {valueStatus && (
                <span style={{ color: statusColor[valueStatus], marginLeft: '8px', textTransform: 'uppercase' }}>
                  ● {valueStatus}
                </span>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type='number'
                value={value}
                onChange={e => { setValue(e.target.value); setError(null); setSuccess(null); }}
                placeholder={`Enter value (${config.min} - ${config.max})`}
                style={{
                  width: '100%',
                  padding: '12px 60px 12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${valueStatus ? statusColor[valueStatus] + '55' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: valueStatus ? statusColor[valueStatus] : 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
              <span style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b', fontSize: '13px',
              }}>
                {config.unit}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              NOTES (optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Any observations...'
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
              }}
            />
          </div>

          {/* Success / Error */}
          {success && (
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#4ade80',
              fontSize: '14px',
            }}>
              {success}
            </div>
          )}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#f87171',
              fontSize: '14px',
            }}>
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Saving...' : '💾 Save Reading'}
          </button>
        </div>

        {/* Right — Recent Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Operator Info */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>LOGGED IN AS</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>👤 {user?.name}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', textTransform: 'uppercase' }}>
              {user?.role}
            </div>
          </div>

          {/* Recent Entries */}
  <div style={{
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '16px',
  flex: 1,
  maxHeight: '500px',
  overflowY: 'auto',
}}>
            <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
              📋 My Recent Entries
            </h3>
            {recentEntries.length === 0 ? (
              <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No entries yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentEntries.map((entry) => (
                  <div key={entry.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${entry.status ? statusColor[entry.status] + '33' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{entry.parameter}</div>
                      <div style={{ color: '#475569', fontSize: '11px' }}>{entry.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          color: entry.status ? statusColor[entry.status] : 'white',
                          fontWeight: 'bold', fontFamily: 'monospace',
                        }}>
                          {entry.value} {entry.unit}
                        </div>
                        {entry.status && (
                          <div style={{
                            color: statusColor[entry.status],
                            fontSize: '10px', textTransform: 'uppercase',
                          }}>
                            {entry.status}
                          </div>
                        )}
                      </div>
                      {/* Delete button — only own entries */}
                      {entry.operator_id === user.id && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '6px',
                            color: '#f87171',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;