import { useState, useEffect } from 'react';
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

const parameterConfig = {
  burning_zone_temp:       { min: 1400, max: 1500, unit: '°C' },
  kiln_inlet_temp:         { min: 900,  max: 1100, unit: '°C' },
  kiln_speed:              { min: 3.0,  max: 4.5,  unit: 'RPM' },
  kiln_feed_rate:          { min: 150,  max: 200,  unit: 'T/hr' },
  coal_feed_rate:          { min: 15,   max: 25,   unit: 'T/hr' },
  raw_mill_feed_rate:      { min: 200,  max: 250,  unit: 'T/hr' },
  raw_mill_outlet_temp:    { min: 80,   max: 95,   unit: '°C' },
  raw_mill_power:          { min: 15,   max: 18,   unit: 'kWh/T' },
  raw_mill_speed:          { min: 14,   max: 16,   unit: 'RPM' },
  cement_mill_feed_rate:   { min: 150,  max: 180,  unit: 'T/hr' },
  cement_mill_power:       { min: 28,   max: 35,   unit: 'kWh/T' },
  cement_mill_outlet_temp: { min: 100,  max: 120,  unit: '°C' },
  cement_fineness:         { min: 3200, max: 3500, unit: 'cm²/g' },
  clinker_production:      { min: 2800, max: 3200, unit: 'T/day' },
  cement_production:       { min: 3300, max: 3700, unit: 'T/day' },
  heat_consumption:        { min: 750,  max: 850,  unit: 'kcal/kg' },
  equipment_availability:  { min: 90,   max: 100,  unit: '%' },
};

const Reports = () => {
  const [hours, setHours] = useState(8);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/reports/shift?hours=${hours}`);
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [hours]);

  const getAvgStatus = (paramName, avg) => {
    const config = parameterConfig[paramName];
    if (!config) return 'normal';
    const v = parseFloat(avg);
    if (v < config.min || v > config.max) return 'critical';
    const range = config.max - config.min;
    if (v < config.min + range * 0.1 || v > config.max - range * 0.1) return 'warning';
    return 'normal';
  };

  const statusColor = {
    normal: '#4ade80',
    warning: '#facc15',
    critical: '#f87171',
  };

  const totalAlerts = report?.alert_stats?.reduce((sum, a) => sum + parseInt(a.count), 0) || 0;
  const criticalAlerts = report?.alert_stats?.find(a => a.status === 'critical')?.count || 0;
  const warningAlerts = report?.alert_stats?.find(a => a.status === 'warning')?.count || 0;

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'parameters', label: '📈 Parameters' },
    { key: 'alerts', label: '🚨 Alert Summary' },
    { key: 'manual', label: '✏️ Manual Entries' },
  ];

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
            📋 Reports
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Shift performance reports and analytics
          </p>
        </div>

        {/* Time Range Selector */}
        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            REPORT PERIOD
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[4, 8, 12, 24].map(h => (
              <button
                key={h}
                onClick={() => setHours(h)}
                style={{
                  padding: '8px 16px',
                  background: hours === h ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${hours === h ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: hours === h ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
          Loading report...
        </div>
      ) : report && (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px', marginBottom: '24px',
          }}>
            {[
              { label: 'PERIOD', value: `Last ${hours}h`, color: 'white' },
              { label: 'TOTAL ALERTS', value: totalAlerts, color: totalAlerts > 0 ? '#f87171' : '#4ade80' },
              { label: 'CRITICAL', value: criticalAlerts, color: criticalAlerts > 0 ? '#f87171' : '#4ade80' },
              { label: 'MANUAL ENTRIES', value: report.manual_entries?.length || 0, color: '#fb923c' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{label}</div>
                <div style={{ color, fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  background: activeTab === tab.key ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === tab.key ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: activeTab === tab.key ? '#fb923c' : '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Most Problematic Parameters */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
                  🚨 Most Problematic Parameters
                </h3>
                {report.problematic_parameters?.length === 0 ? (
                  <div style={{ color: '#4ade80', fontSize: '14px' }}>✅ No problems detected!</div>
                ) : (
                  report.problematic_parameters?.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <div style={{ color: 'white', fontSize: '13px' }}>
                        {parameterDisplayNames[p.parameter_name] || p.parameter_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          color: p.worst_status === 'critical' ? '#f87171' : '#facc15',
                          fontSize: '12px', fontWeight: 'bold',
                        }}>
                          {p.alert_count} alerts
                        </span>
                        <span style={{
                          background: p.worst_status === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                          color: p.worst_status === 'critical' ? '#f87171' : '#facc15',
                          fontSize: '10px', padding: '2px 6px',
                          borderRadius: '4px', textTransform: 'uppercase',
                        }}>
                          {p.worst_status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Alert Breakdown */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
                  📊 Alert Breakdown
                </h3>
                {report.alert_stats?.length === 0 ? (
                  <div style={{ color: '#4ade80', fontSize: '14px' }}>✅ No alerts in this period!</div>
                ) : (
                  report.alert_stats?.map((a, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '12px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <div style={{
                        color: a.status === 'critical' ? '#f87171' : '#facc15',
                        fontSize: '14px', fontWeight: '600', textTransform: 'uppercase',
                      }}>
                        {a.status === 'critical' ? '🔴' : '🟡'} {a.status}
                      </div>
                      <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                        {a.count}
                      </div>
                    </div>
                  ))
                )}
                <div style={{
                  marginTop: '16px', paddingTop: '12px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>TOTAL</span>
                  <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{totalAlerts}</span>
                </div>
              </div>
            </div>
          )}

          {/* PARAMETERS TAB */}
          {activeTab === 'parameters' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                {['PARAMETER', 'AVG', 'MIN', 'MAX', 'READINGS', 'STATUS'].map(h => (
                  <div key={h} style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>{h}</div>
                ))}
              </div>

              {/* Table Rows */}
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {report.parameter_stats?.map((param, i) => {
                  const status = getAvgStatus(param.parameter_name, param.avg_value);
                  const config = parameterConfig[param.parameter_name];
                  return (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                      padding: '12px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      alignItems: 'center',
                    }}>
                      <div style={{ color: 'white', fontSize: '13px' }}>
                        {parameterDisplayNames[param.parameter_name] || param.parameter_name}
                        {config && (
                          <div style={{ color: '#475569', fontSize: '10px' }}>
                            Safe: {config.min} - {config.max} {config.unit}
                          </div>
                        )}
                      </div>
                      <div style={{ color: statusColor[status], fontFamily: 'monospace', fontSize: '13px' }}>
                        {parseFloat(param.avg_value).toFixed(1)}
                      </div>
                      <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px' }}>
                        {parseFloat(param.min_value).toFixed(1)}
                      </div>
                      <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px' }}>
                        {parseFloat(param.max_value).toFixed(1)}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '13px' }}>
                        {param.reading_count}
                      </div>
                      <div style={{
                        background: `${statusColor[status]}22`,
                        color: statusColor[status],
                        fontSize: '11px', padding: '2px 8px',
                        borderRadius: '4px', textTransform: 'uppercase',
                        display: 'inline-block', fontWeight: '600',
                      }}>
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
                Alert Summary — Last {hours} hours
              </h3>
              {report.problematic_parameters?.length === 0 ? (
                <div style={{ color: '#4ade80', textAlign: 'center', padding: '40px' }}>
                  ✅ No alerts in this period! Plant ran smoothly.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {report.problematic_parameters?.map((p, i) => (
                    <div key={i} style={{
                      background: p.worst_status === 'critical' ? 'rgba(239,68,68,0.05)' : 'rgba(234,179,8,0.05)',
                      border: `1px solid ${p.worst_status === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
                      borderRadius: '8px',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                          {parameterDisplayNames[p.parameter_name] || p.parameter_name}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                          {p.alert_count} alerts generated in last {hours} hours
                        </div>
                      </div>
                      <span style={{
                        background: p.worst_status === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                        color: p.worst_status === 'critical' ? '#f87171' : '#facc15',
                        padding: '4px 12px', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                      }}>
                        {p.worst_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MANUAL ENTRIES TAB */}
          {activeTab === 'manual' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>
                Manual Entries — Last {hours} hours
              </h3>
              {report.manual_entries?.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                  No manual entries in this period
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                  {report.manual_entries?.map((entry, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                          {parameterDisplayNames[entry.parameter_name] || entry.parameter_name}
                        </div>
                        <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>
                          By {entry.operator_name || 'Unknown'} · {new Date(entry.recorded_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit', month: 'short',
                            hour: '2-digit', minute: '2-digit', hour12: true,
                          })}
                        </div>
                      </div>
                      <div style={{ color: '#fb923c', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {parseFloat(entry.value).toFixed(2)} {entry.unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;