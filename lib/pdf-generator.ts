import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

// Configuration for name placement
// Adjust these values to fit your specific certificate template
const CONFIG = {
    fontSize: 60, // Increased font size
    yOffset: 0, // Offset from center. Positive = up, Negative = down.
    color: rgb(0.27, 0.54, 0.97), // #4589f8
    qrSize: 100, // Size of QR code
    qrBottomOffset: 60, // Distance from bottom
};

export async function generateCertificate(name: string, templateBytes: Uint8Array, ticketId: string): Promise<Uint8Array> {
    try {
        const pdfDoc = await PDFDocument.load(templateBytes);
        pdfDoc.registerFontkit(fontkit);

        // Load Custom Font
        const fontPath = path.join(process.cwd(), 'public', 'fonts', 'GreatVibes-Regular.ttf');
        const fontBytes = fs.readFileSync(fontPath);
        const font = await pdfDoc.embedFont(fontBytes);

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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gdg-cert-app.vercel.app/';
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
