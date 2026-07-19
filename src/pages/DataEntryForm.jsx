import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Save, RefreshCw } from 'lucide-react';
import { calculateWQI, getWQIAlertLevel } from '../utils/wqiCalculator';

const DataEntryForm = () => {
  const [formData, setFormData] = useState({
    InsID: '',
    DateIns: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm format
    Coordinate: '',
    DO: '',
    pH: '',
    EC: '',
    Temp: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [wqiResult, setWqiResult] = useState(null);

  // Generate an ID if empty on mount
  useEffect(() => {
    if (!formData.InsID) {
      const randomId = 'INS-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      setFormData(prev => ({ ...prev, InsID: randomId }));
    }
  }, []);

  // Recalculate WQI whenever DO, pH, EC, Temp changes
  useEffect(() => {
    const doVal = parseFloat(formData.DO);
    const phVal = parseFloat(formData.pH);
    const ecVal = parseFloat(formData.EC);
    const tempVal = parseFloat(formData.Temp);

    if (!isNaN(doVal) && !isNaN(phVal) && !isNaN(ecVal) && !isNaN(tempVal)) {
      const wqi = calculateWQI(doVal, phVal, ecVal, tempVal);
      setWqiResult(wqi);
    } else {
      setWqiResult(null);
    }
  }, [formData.DO, formData.pH, formData.EC, formData.Temp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          Coordinate: `${position.coords.latitude}, ${position.coords.longitude}`
        }));
        setIsLocating(false);
      },
      (error) => {
        alert('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    
    if (!scriptUrl) {
      console.log('Submitting (Mock):', { ...formData, WQI: wqiResult, Image: imageFile });
      alert('บันทึกข้อมูลเรียบร้อย (ระบบจำลอง - ยังไม่ได้ใส่ API URL ใน .env)');
      return;
    }

    alert('กำลังบันทึกข้อมูล... กรุณารอสักครู่');

    try {
      const payload = {
        InsID: formData.InsID,
        DateIns: formData.DateIns,
        Coordinate: formData.Coordinate,
        DO: formData.DO,
        pH: formData.pH,
        EC: formData.EC,
        Temp: formData.Temp,
        WQI: wqiResult,
      };

      if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
          payload.image = reader.result;
          payload.imageMimeType = imageFile.type;
          await sendData(scriptUrl, payload);
        };
      } else {
        await sendData(scriptUrl, payload);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการเตรียมข้อมูล');
    }
  };

  const sendData = async (url, data) => {
    try {
      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      alert('บันทึกข้อมูลเข้า Google Sheet เรียบร้อยแล้ว!');
      // รีเฟรชหน้าเพื่อเคลียร์ฟอร์ม
      window.location.reload();
    } catch (error) {
      console.error('Submit Error:', error);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูลไปที่ Google Sheet');
    }
  };

  const alertInfo = wqiResult !== null ? getWQIAlertLevel(wqiResult) : null;

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <h1>บันทึกข้อมูลคุณภาพน้ำ</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>ข้อมูลทั่วไป</h2>
          <div className="form-group">
            <label className="form-label">รหัสการตรวจ (InsID)</label>
            <input type="text" className="form-input" name="InsID" value={formData.InsID} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">วันที่และเวลา (DateIns)</label>
            <input type="datetime-local" className="form-input" name="DateIns" value={formData.DateIns} onChange={handleInputChange} required />
          </div>
          
          <div className="form-group">
            <label className="form-label">พิกัดสถานที่ (Coordinate)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="form-input" name="Coordinate" value={formData.Coordinate} onChange={handleInputChange} placeholder="Lat, Long" required />
              <button type="button" className="btn btn-outline" onClick={getLocation} disabled={isLocating}>
                {isLocating ? <RefreshCw className="spinner" size={20} /> : <MapPin size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">รูปภาพสถานที่</label>
            <label className="form-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Camera size={32} style={{ margin: '0 auto 8px' }} />
                <span>ถ่ายภาพ หรือ เลือกไฟล์</span>
              </div>
            </label>
            {imagePreview && (
              <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2>ผลการตรวจวัด</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">DO (mg/L)</label>
              <input type="number" step="0.01" className="form-input" name="DO" value={formData.DO} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">pH</label>
              <input type="number" step="0.01" className="form-input" name="pH" value={formData.pH} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">EC (µS/cm)</label>
              <input type="number" step="0.01" className="form-input" name="EC" value={formData.EC} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Temp (°C)</label>
              <input type="number" step="0.01" className="form-input" name="Temp" value={formData.Temp} onChange={handleInputChange} required />
            </div>
          </div>
        </div>

        {wqiResult !== null && alertInfo && (
          <div className="card" style={{ backgroundColor: alertInfo.color, color: 'white', borderColor: alertInfo.color }}>
            <h2 style={{ color: 'white' }}>ผลการประเมิน (Normal WQI)</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1' }}>{wqiResult}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>เกณฑ์: {alertInfo.label}</div>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
              {alertInfo.desc}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.25rem' }}>
          <Save size={24} /> บันทึกข้อมูล
        </button>
      </form>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default DataEntryForm;
