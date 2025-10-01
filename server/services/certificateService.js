const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class CertificateService {
  constructor() {
    this.certificatesDir = path.join(__dirname, '../certificates');
    this.ensureCertificatesDir();
  }

  ensureCertificatesDir() {
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  async generateCertificate(certificateData) {
    const { user, event, certificateId } = certificateData;
    
    // Create PDF document in A4 landscape
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50 // Add margins for professional look
    });

    console.log('🔍 PDF Document created in landscape mode:', {
      width: doc.page.width,
      height: doc.page.height,
      layout: 'landscape',
      actualSize: doc.page.size
    });
    
    // Verify landscape dimensions
    if (doc.page.width < doc.page.height) {
      console.error('❌ ERROR: PDF is in PORTRAIT mode! Width:', doc.page.width, 'Height:', doc.page.height);
    } else {
      console.log('✅ PDF is correctly in LANDSCAPE mode. Width:', doc.page.width, 'Height:', doc.page.height);
    }

    // Generate QR code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates/verify/${user._id}/${event._id}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 100,
      margin: 1
    });

    // Create file path with new naming convention
    const fileName = `${event._id}_${user._id}.pdf`;
    const filePath = path.join(this.certificatesDir, fileName);

    // Pipe PDF to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add professional design elements
    await this.addProfessionalDesign(doc, user, event, qrCodeDataURL);

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          filePath,
          fileName,
          certificateId
        });
      });
      stream.on('error', reject);
    });
  }

  async addProfessionalDesign(doc, user, event, qrCodeDataURL) {
    // Add background watermark/border
    await this.addBackgroundWatermark(doc);
    
    // Add top border line
    this.addTopBorder(doc);
    
    // Add header section with logo and title
    await this.addHeaderSection(doc, event);
    
    // Add main content section
    this.addMainContent(doc, user, event);
    
    // Add footer with signature lines
    this.addFooterSection(doc);
    
    // Add QR code in bottom-right
    this.addQRCode(doc, qrCodeDataURL);
  }

  async addBackgroundWatermark(doc) {
    // Add a subtle background watermark
    const watermarkPath = path.join(__dirname, '../assets/certificate-bg.jpg');
    
    if (fs.existsSync(watermarkPath)) {
      try {
        // Add as faded background
        doc.image(watermarkPath, 50, 50, { 
          width: 742, 
          height: 495,
          opacity: 0.1 // Make it very faded
        });
        console.log('✅ Background watermark added');
      } catch (error) {
        console.error('❌ Error adding background watermark:', error);
      }
    }
  }

  addTopBorder(doc) {
    // Add elegant top border line
    const pageWidth = doc.page.width;
    const margin = 50;
    
    doc.strokeColor('#2c3e50')
       .lineWidth(3)
       .moveTo(margin, 80)
       .lineTo(pageWidth - margin, 80)
       .stroke();
  }

  async addHeaderSection(doc, event) {
    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    // Add event logo (if exists)
    const logoPath = path.join(__dirname, '../../client/public/logo.png');
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, pageWidth/2 - 30, 100, { 
          width: 60, 
          height: 60
        });
      } catch (error) {
        console.log('Logo not found, continuing without logo');
      }
    }

    // Add main title
    doc.fontSize(42)
       .font('Times-Bold')
       .fillColor('#2c3e50')
       .text('Certificate of Participation', margin, 120, {
         align: 'center',
         width: contentWidth
       });
  }

  addMainContent(doc, user, event) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    // Calculate vertical positions for proper centering
    const startY = 200; // Start below the title
    const lineHeight = 30; // Space between lines

    // Add certification text
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#34495e')
       .text('This is to certify that', margin, startY, {
         align: 'center',
         width: contentWidth
       });

    // Add participant name (large, bold, underlined)
    doc.fontSize(30)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(user.name, margin, startY + lineHeight, {
         align: 'center',
         width: contentWidth,
         underline: true
       });

    // Add participation text
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#34495e')
       .text('has successfully participated in', margin, startY + (lineHeight * 2.5), {
         align: 'center',
         width: contentWidth
       });

    // Add event title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(event.title, margin, startY + (lineHeight * 3.5), {
         align: 'center',
         width: contentWidth
       });

    // Add completion date
    const completionDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fontSize(16)
       .font('Helvetica-Oblique')
       .fillColor('#7f8c8d')
       .text(`Completed on: ${completionDate}`, margin, startY + (lineHeight * 5), {
         align: 'center',
         width: contentWidth
       });
  }

  addFooterSection(doc) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;

    // Position signature lines near the bottom
    const signatureY = pageHeight - 120;

    // Left signature line
    const leftX = margin + 50;
    const rightX = pageWidth - margin - 200;

    // Left signature line
    doc.strokeColor('#bdc3c7')
       .lineWidth(1)
       .moveTo(leftX, signatureY)
       .lineTo(leftX + 150, signatureY)
       .stroke();

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text('Coordinator', leftX, signatureY + 10, {
         align: 'center',
         width: 150
       });

    // Right signature line
    doc.strokeColor('#bdc3c7')
       .lineWidth(1)
       .moveTo(rightX, signatureY)
       .lineTo(rightX + 150, signatureY)
       .stroke();

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text('Head of Department', rightX, signatureY + 10, {
         align: 'center',
         width: 150
       });
  }

  addQRCode(doc, qrCodeDataURL) {
    // Add QR code in center
    const qrSize = 100;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    
    const x = (pageWidth - qrSize) / 2; // Center horizontally
    const y = pageHeight - qrSize - margin - 20; // Bottom with extra margin

    console.log('🔍 Adding QR code at position:', { x, y, qrSize, pageWidth, pageHeight });

    // Add QR code
    doc.image(qrCodeDataURL, x, y, { width: qrSize, height: qrSize });
  }

  getCertificatePath(certificateId) {
    // First try the new naming convention (eventId_userId.pdf)
    const files = fs.readdirSync(this.certificatesDir);
    const newFormatFile = files.find(file => file.includes(certificateId));
    
    if (newFormatFile) {
      return path.join(this.certificatesDir, newFormatFile);
    }
    
    // Fallback to old naming convention (certificate_certificateId.pdf)
    const oldFormatFile = `certificate_${certificateId}.pdf`;
    const oldPath = path.join(this.certificatesDir, oldFormatFile);
    
    if (fs.existsSync(oldPath)) {
      return oldPath;
    }
    
    // If neither exists, return the new format path (for new certificates)
    return path.join(this.certificatesDir, `certificate_${certificateId}.pdf`);
  }

  async deleteCertificate(certificateId) {
    const filePath = this.getCertificatePath(certificateId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

module.exports = new CertificateService();
