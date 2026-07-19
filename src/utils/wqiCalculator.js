// WQI Calculation Logic based on "WQI Cal.pdf"

export const calculateWQI = (DO, pH, EC, Temp) => {
  if (DO == null || pH == null || EC == null || Temp == null) return null;

  // Step 1: Calculate sub-indexes
  
  // qDO
  // Note: 14.6 is the max saturated DO in pure water
  let qDO = ((14.6 - DO) / (14.6 - 6.0)) * 100;
  // Cap qDO to avoid negative or excessively high values (optional but good practice)
  qDO = Math.max(0, Math.min(100, qDO));

  // qpH
  // Absolute value of |pH - 7.0|
  let qpH = (Math.abs(pH - 7.0) / 1.5) * 100;
  qpH = Math.max(0, Math.min(100, qpH));

  // qEC
  let qEC = (EC / 500) * 100;
  qEC = Math.max(0, Math.min(100, qEC));

  // qTEMP
  let qTEMP = (Temp / 35) * 100;
  qTEMP = Math.max(0, Math.min(100, qTEMP));

  // Step 2: Calculate Normal WQI
  const normalWQI = 100 - ((0.490 * qDO) + (0.294 * qpH) + (0.118 * qEC) + (0.098 * qTEMP));
  
  // Return formatted to 2 decimal places
  return Number(normalWQI.toFixed(2));
};

export const getWQIAlertLevel = (wqi) => {
  if (wqi >= 91) return { level: 'Excellent', color: 'var(--wqi-excellent)', label: 'ดีมาก', desc: 'น้ำสะอาดมาก เหมาะกับการอนุรักษ์สัตว์น้ำ เกษตรกรรม ผลิตประปา' };
  if (wqi >= 71) return { level: 'Good', color: 'var(--wqi-good)', label: 'ดี', desc: 'เหมาะสำหรับการประมง การเกษตร ผลิตประปา' };
  if (wqi >= 61) return { level: 'Fair', color: 'var(--wqi-fair)', label: 'พอใช้', desc: 'คุณภาพปานกลาง ใช้ในการเกษตรได้ ระบบประปาต้องบำบัดเข้มงวด' };
  if (wqi >= 31) return { level: 'Poor', color: 'var(--wqi-poor)', label: 'เสื่อมโทรม', desc: 'คุณภาพต่ำกว่ามาตรฐานไม่เหมาะกับการประมง พืชที่ไวต่อเกลือ' };
  return { level: 'Very Poor', color: 'var(--wqi-very-poor)', label: 'เสื่อมโทรมมาก', desc: 'น้ำมีสารปนเปื้อนสูง ไม่เหมาะกับการประมง เกษตร หรือผลิตประปา' };
};
