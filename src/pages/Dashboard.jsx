import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Filter, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('WQI');

  useEffect(() => {
    const fetchData = async () => {
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      if (!scriptUrl) {
        setLoading(false);
        setError('ไม่พบ URL ของฐานข้อมูล กรุณาตั้งค่า VITE_GOOGLE_SCRIPT_URL');
        return;
      }
      try {
        const response = await fetch(scriptUrl);
        const result = await response.json();
        if (result.status === 'success') {
          // แปลงคีย์ให้เป็นตัวเล็กสำหรับใช้งานใน recharts
          const formattedData = result.data.map(item => ({
            id: item.InsID || '',
            date: item.DateIns || '',
            wqi: Number(item.WQI) || 0,
            do: Number(item.DO) || 0,
            ph: Number(item.pH) || 0,
            ec: Number(item.EC) || 0,
            temp: Number(item.Temp) || 0,
          }));
          setData(formattedData);
        } else {
          setError(result.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ (CORS หรือ URL ผิด)');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Simple filter logic
  const filteredData = data.filter(d => {
    if (!startDate && !endDate) return true;
    const dateObj = new Date(d.date);
    if (startDate && new Date(startDate) > dateObj) return false;
    if (endDate && new Date(endDate) < dateObj) return false;
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

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <RefreshCw className="spinner" size={32} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
          <p>กำลังดึงข้อมูลจากฐานข้อมูล...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ borderLeft: '4px solid var(--wqi-very-poor)' }}>
          <p style={{ color: 'var(--wqi-very-poor)', fontWeight: 'bold' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
