const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createTemplate() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 Landscape
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.95, 0.95, 0.95),
  });

  // Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 5,
    color: rgb(1, 1, 1),
  });

  // Title
  page.drawText('Certificate of Participation', {
    x: width / 2 - 200,
    y: height - 150,
    size: 30,
    font,
    color: rgb(0.2, 0.4, 0.8),
  });

  // Subtitle
  page.drawText('This is to certify that', {
    x: width / 2 - 100,
    y: height - 220,
    size: 20,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Footer
  page.drawText('Has successfully participated in the event.', {
    x: width / 2 - 150,
    y: 150,
    size: 15,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(__dirname, 'public/uploads/certificate_template.pdf'), pdfBytes);
  console.log('Template created successfully!');
}

createTemplate();
