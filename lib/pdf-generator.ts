import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

// Configuration for name placement
// Adjust these values to fit your specific certificate template
const CONFIG = {
    fontSize: 60, // Increased font size
    yOffset: 0, // Offset from center. Positive = up, Negative = down.
    color: rgb(0.2, 0.2, 0.2), // Dark gray
    qrSize: 100, // Size of QR code
    qrBottomOffset: 50, // Distance from bottom
};

export async function generateCertificate(name: string, templateBytes: Uint8Array, ticketId: string): Promise<Uint8Array> {
    try {
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Use Standard Font (Helvetica Bold is very similar to Roboto/Google Sans)
        // This avoids external dependency issues and ensures reliability
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Calculate text width to center it
        const textWidth = font.widthOfTextAtSize(name, CONFIG.fontSize);

        // Calculate position
        const x = (width - textWidth) / 2;
        const y = (height / 2) - 30 + CONFIG.yOffset;

        // Draw text
        firstPage.drawText(name, {
            x: x,
            y: y,
            size: CONFIG.fontSize,
            font: font,
            color: CONFIG.color,
        });

        // Generate QR Code
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verifyUrl = `${appUrl}/verify/${ticketId}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl);
        const qrImage = await pdfDoc.embedPng(qrDataUrl);

        // Draw QR Code at bottom center
        const qrX = (width - CONFIG.qrSize) / 2;
        const qrY = CONFIG.qrBottomOffset;

        firstPage.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: CONFIG.qrSize,
            height: CONFIG.qrSize,
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
