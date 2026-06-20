import { useState, useEffect } from 'react';
import API from '../api/axios';

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState('query');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

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

  // Fetch active alerts for analysis tab
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await API.get('/alerts/active');
        setAlerts(res.data.data);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };
    fetchAlerts();
  }, []);

  // Handle natural language query
  const handleQuery = async () => {
    if (!question.trim()) return;
    setQueryLoading(true);
    setAnswer(null);
    try {
      const res = await API.post('/ai/query', { question });
      setAnswer(res.data.data.answer);
    } catch (err) {
      setAnswer('Failed to get AI response. Please try again.');
    } finally {
      setQueryLoading(false);
    }
  };

  // Handle alert analysis
  const handleAnalyze = async () => {
    if (!selectedAlert) return;
    setAnalyzeLoading(true);
    setAnalysis(null);
    try {
      const res = await API.post('/ai/analyze', { alert_id: selectedAlert });
      setAnalysis(res.data.data.recommendation);
    } catch (err) {
      setAnalysis('Failed to analyze alert. Please try again.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // Handle shift report
  const handleReport = async () => {
    setReportLoading(true);
    setReport(null);
    try {
      const res = await API.post('/ai/report');
      setReport(res.data.data.report);
    } catch (err) {
      setReport('Failed to generate report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const tabs = [
    { key: 'query', label: '💬 Ask AI' },
    { key: 'analyze', label: '🔍 Analyze Alert' },
    { key: 'report', label: '📋 Shift Report' },
  ];

  const formatResponse = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <p key={i} style={{
        margin: '4px 0',
        color: line.startsWith('*') || line.startsWith('-') || line.startsWith('•') ? '#cbd5e1' : '#94a3b8',
        fontSize: '14px',
        lineHeight: '1.6',
        paddingLeft: line.startsWith('*') || line.startsWith('-') || line.startsWith('•') ? '16px' : '0',
      }}>
        {line}
      </p>
    ));
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
          🤖 AI Insights
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Powered by Google Gemini AI — Ask questions, analyze alerts, generate reports
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeTab === tab.key ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '800px' }}>

        {/* ASK AI TAB */}
        {activeTab === 'query' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
            }}>
              <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
                💬 Ask anything about your plant
              </h2>

              {/* Suggested questions */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 8px' }}>SUGGESTED QUESTIONS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    'What is the current plant health status?',
                    'Which parameters need attention?',
                    'Is kiln operating normally?',
                    'What are the active issues?',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuestion(q)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: '20px',
                        color: '#fb923c',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder='Ask about plant status, parameter analysis, recommendations...'
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '12px',
                }}
              />

              <button
                onClick={handleQuery}
                disabled={queryLoading || !question.trim()}
                style={{
                  padding: '10px 24px',
                  background: queryLoading || !question.trim()
                    ? 'rgba(249,115,22,0.3)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: queryLoading || !question.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {queryLoading ? '⏳ Thinking...' : '🤖 Ask Gemini'}
              </button>
            </div>

            {/* Answer */}
            {queryLoading && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                color: '#fb923c',
              }}>
                🤖 Gemini is analyzing your plant data...
              </div>
            )}
            {answer && !queryLoading && (
              <div style={{
                background: 'rgba(249,115,22,0.05)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{ color: '#fb923c', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
                  🤖 GEMINI RESPONSE
                </div>
                {formatResponse(answer)}
              </div>
            )}
          </div>
        )}

        {/* ANALYZE ALERT TAB */}
        {activeTab === 'analyze' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
            }}>
              <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
                🔍 Analyze an Alert
              </h2>

              {alerts.length === 0 ? (
                <div style={{ color: '#4ade80', textAlign: 'center', padding: '24px' }}>
                  ✅ No active alerts to analyze!
                </div>
              ) : (
                <>
                  <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    SELECT ALERT TO ANALYZE
                  </label>
                  <select
                    value={selectedAlert || ''}
                    onChange={e => { setSelectedAlert(e.target.value); setAnalysis(null); }}
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
                      marginBottom: '16px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="" style={{ background: '#1e293b' }}>-- Select an alert --</option>
                    {alerts.map(alert => (
                      <option key={alert.id} value={alert.id} style={{ background: '#1e293b' }}>
                        [{alert.status.toUpperCase()}] {parameterDisplayNames[alert.parameter_name] || alert.parameter_name} — {alert.value}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAnalyze}
                    disabled={analyzeLoading || !selectedAlert}
                    style={{
                      padding: '10px 24px',
                      background: analyzeLoading || !selectedAlert
                        ? 'rgba(249,115,22,0.3)'
                        : 'linear-gradient(135deg, #f97316, #ea580c)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: analyzeLoading || !selectedAlert ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {analyzeLoading ? '⏳ Analyzing...' : '🔍 Analyze with AI'}
                  </button>
                </>
              )}
            </div>

            {/* Analysis Result */}
            {analyzeLoading && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                color: '#fb923c',
              }}>
                🤖 Gemini is analyzing the alert...
              </div>
            )}
            {analysis && !analyzeLoading && (
              <div style={{
                background: 'rgba(249,115,22,0.05)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{ color: '#fb923c', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
                  🤖 AI ANALYSIS & RECOMMENDATIONS
                </div>
                {formatResponse(analysis)}
              </div>
            )}
          </div>
        )}

        {/* SHIFT REPORT TAB */}
        {activeTab === 'report' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
            }}>
              <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>
                📋 Generate Shift Report
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>
                AI will analyze last 8 hours of plant data and generate a comprehensive shift report.
              </p>

              <button
                onClick={handleReport}
                disabled={reportLoading}
                style={{
                  padding: '10px 24px',
                  background: reportLoading
                    ? 'rgba(249,115,22,0.3)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: reportLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {reportLoading ? '⏳ Generating Report...' : '📋 Generate Shift Report'}
              </button>
            </div>

            {/* Report Result */}
            {reportLoading && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                color: '#fb923c',
              }}>
                🤖 Gemini is generating your shift report...
              </div>
            )}
            {report && !reportLoading && (
              <div style={{
                background: 'rgba(249,115,22,0.05)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
                maxHeight: '600px',
                overflowY: 'auto',
              }}>
                <div style={{ color: '#fb923c', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
                  📋 AI GENERATED SHIFT REPORT
                </div>
                {formatResponse(report)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;