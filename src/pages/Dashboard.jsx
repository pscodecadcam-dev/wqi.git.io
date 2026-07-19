import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Filter } from 'lucide-react';

// Mock Data
const mockData = [
  { id: 'INS-A1B2', date: '2026-07-15T10:00', wqi: 75, do: 6.5, ph: 7.2, ec: 300, temp: 28 },
  { id: 'INS-C3D4', date: '2026-07-16T11:30', wqi: 82, do: 7.1, ph: 7.0, ec: 250, temp: 27 },
  { id: 'INS-E5F6', date: '2026-07-17T09:15', wqi: 55, do: 4.5, ph: 6.5, ec: 600, temp: 30 },
  { id: 'INS-G7H8', date: '2026-07-18T14:20', wqi: 95, do: 8.2, ph: 7.1, ec: 150, temp: 26 },
];

const Dashboard = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('WQI');

  // Simple filter logic
  const filteredData = mockData.filter(d => {
    if (!startDate && !endDate) return true;
    const date = new Date(d.date);
    if (startDate && new Date(startDate) > date) return false;
    if (endDate && new Date(endDate) < date) return false;
    return true;
  });

  const getChartColor = (key) => {
    switch(key) {
      case 'wqi': return 'var(--color-primary)';
      case 'do': return '#457b9d';
      case 'ph': return '#dda15e';
      case 'ec': return '#e63946';
      case 'temp': return '#f4a261';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <h1>ภาพรวมข้อมูล (Dashboard)</h1>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Filter size={20} color="var(--color-text-muted)" />
          <h2 style={{ margin: 0 }}>กรองข้อมูล</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">เริ่มต้น</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">สิ้นสุด</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          {['WQI', 'DO', 'pH', 'EC', 'Temp'].map(tab => (
            <button 
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}
              style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" tickFormatter={(v) => v.split('T')[0]} stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                labelFormatter={(v) => new Date(v).toLocaleString('th-TH')}
              />
              <Line 
                type="monotone" 
                dataKey={activeTab.toLowerCase()} 
                stroke={getChartColor(activeTab.toLowerCase())} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>รายการข้อมูล (Data List)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>วันที่</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>WQI</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>DO</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>pH</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>EC</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Temp</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{row.date.split('T')[0]}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{row.wqi}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{row.do}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{row.ph}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{row.ec}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{row.temp}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    ไม่พบข้อมูลในช่วงเวลาที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
