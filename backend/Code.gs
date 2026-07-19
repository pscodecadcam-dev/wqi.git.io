// Google Apps Script สำหรับรับข้อมูลจาก WQI Web App
// วิธีใช้งาน:
// 1. สร้าง Google Sheet ใหม่ และตั้งชื่อคอลัมน์ A ถึง I ดังนี้
//    A: InsID, B: DateIns, C: Coordinate, D: URL, E: DO, F: pH, G: EC, H: Temp, I: WQI
// 2. สร้าง Folder ใน Google Drive สำหรับเก็บรูปภาพ (ตั้งให้แชร์เป็น "ทุกคนที่มีลิงก์สามารถดูได้" ถ้าต้องการให้เว็บดึงรูปมาโชว์ได้)
// 3. ก๊อปปี้ ID ของ Folder นั้นมาใส่ในตัวแปร FOLDER_ID ด้านล่าง
// 4. นำโค้ดนี้ไปวางใน ส่วนขยาย -> Apps Script (Extensions -> Apps Script)
// 5. กด Deploy -> New deployment -> เลือกประเภท Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 6. กด Deploy (และ Authorize Access ให้เรียบร้อย)
// 7. นำ Web App URL ที่ได้ ไปเชื่อมกับ React App ของคุณ

const FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE"; // เปลี่ยนตรงนี้

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    let imageUrl = "";
    
    // จัดการรูปภาพ (ถ้ามี)
    if (data.image) {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      // สมมติว่าส่งภาพมาเป็น base64
      const blob = Utilities.newBlob(Utilities.base64Decode(data.image.split(',')[1]), data.imageMimeType, data.InsID + ".jpg");
      const file = folder.createFile(blob);
      imageUrl = file.getUrl();
    }
    
    // บันทึกลง Sheet
    sheet.appendRow([
      data.InsID,
      data.DateIns,
      data.Coordinate,
      imageUrl,
      data.DO,
      data.pH,
      data.EC,
      data.Temp,
      data.WQI
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data saved successfully" }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// สำหรับให้ Web App ตอบสนองต่อ OPTIONS request (CORS)
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
