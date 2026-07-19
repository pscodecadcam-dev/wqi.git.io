import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter } from 'lucide-react';
import { getWQIAlertLevel } from '../utils/wqiCalculator';

// Mock Data
const mockData = [
  { id: 'INS-A1B2', date: '2026-07-15T10:00', lat: 13.7563, lng: 100.5018, wqi: 75, do: 6.5, ph: 7.2 },
  { id: 'INS-C3D4', date: '2026-07-16T11:30', lat: 13.7367, lng: 100.5231, wqi: 82, do: 7.1, ph: 7.0 },
  { id: 'INS-E5F6', date: '2026-07-17T09:15', lat: 13.7200, lng: 100.5500, wqi: 25, do: 2.5, ph: 6.5 },
  { id: 'INS-G7H8', date: '2026-07-18T14:20', lat: 13.7700, lng: 100.4800, wqi: 95, do: 8.2, ph: 7.1 },
  { id: 'INS-I9J0', date: '2026-07-18T15:00', lat: 13.7450, lng: 100.5100, wqi: 50, do: 4.5, ph: 6.8 },
];

const MapView = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logic
  const filteredData = mockData.filter(d => {
    if (!startDate && !endDate) return true;
    const date = new Date(d.date);
    if (startDate && new Date(startDate) > date) return false;
    if (endDate && new Date(endDate) < date) return false;
    return true;
  });

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <h1>แผนที่จุดตรวจวัด (Map View)</h1>

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
    </div>
  );
};

export default MapView;
