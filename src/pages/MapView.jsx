import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, RefreshCw } from 'lucide-react';
import { getWQIAlertLevel } from '../utils/wqiCalculator';

const MapView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
          const formattedData = result.data.map(item => {
            // Coordinate from format "Lat, Long"
            const coordStr = item.Coordinate || '';
            const coords = coordStr.split(',');
            const lat = coords[0] ? Number(coords[0].trim()) : 0;
            const lng = coords[1] ? Number(coords[1].trim()) : 0;
            
            return {
              id: item.InsID || '',
              date: item.DateIns || '',
              lat: lat,
              lng: lng,
              wqi: Number(item.WQI) || 0,
              do: Number(item.DO) || 0,
              ph: Number(item.pH) || 0,
            };
          }).filter(item => item.lat !== 0 && item.lng !== 0);
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

  // Filter logic
  const filteredData = data.filter(d => {
    if (!startDate && !endDate) return true;
    const dateObj = new Date(d.date);
    if (startDate && new Date(startDate) > dateObj) return false;
    if (endDate && new Date(endDate) < dateObj) return false;
    return true;
  });

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <h1>แผนที่จุดตรวจวัด (Map View)</h1>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <RefreshCw className="spinner" size={32} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
          <p>กำลังดึงพิกัดจากฐานข้อมูล...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ borderLeft: '4px solid var(--wqi-very-poor)' }}>
          <p style={{ color: 'var(--wqi-very-poor)', fontWeight: 'bold' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
      <div className="card" style={{ marginBottom: '1rem' }}>
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

      <div className="map-container">
        <MapContainer center={[13.7563, 100.5018]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredData.map(point => {
            const alertInfo = getWQIAlertLevel(point.wqi);
            return (
              <CircleMarker 
                key={point.id}
                center={[point.lat, point.lng]}
                pathOptions={{ 
                  color: alertInfo.color, 
                  fillColor: alertInfo.color, 
                  fillOpacity: 0.7,
                  weight: 2
                }}
                radius={12}
              >
                <Popup>
                  <div style={{ fontFamily: 'var(--font-prompt)' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                      {point.id}
                    </h3>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <strong>WQI:</strong> <span style={{ color: alertInfo.color, fontWeight: 'bold' }}>{point.wqi} ({alertInfo.label})</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <strong>วันที่:</strong> {new Date(point.date).toLocaleString('th-TH')}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>คำอธิบายสัญลักษณ์</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {[
            { label: 'ดีมาก (91-100)', color: 'var(--wqi-excellent)' },
            { label: 'ดี (71-90)', color: 'var(--wqi-good)' },
            { label: 'พอใช้ (61-70)', color: 'var(--wqi-fair)' },
            { label: 'เสื่อมโทรม (31-60)', color: 'var(--wqi-poor)' },
            { label: 'เสื่อมโทรมมาก (0-30)', color: 'var(--wqi-very-poor)' },
          ].map(leg => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: leg.color }}></div>
              <span>{leg.label}</span>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default MapView;
