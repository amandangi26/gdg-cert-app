import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Configuration for name placement
// Adjust these values to fit your specific certificate template
const CONFIG = {
    fontSize: 40, // Increased font size
    yOffset: 0, // Offset from center. Positive = up, Negative = down.
    color: rgb(0.2, 0.2, 0.2), // Dark gray
};

export async function generateCertificate(name: string, templatePath: string): Promise<Uint8Array> {
    try {
        const fullPath = path.join(process.cwd(), 'public', templatePath);
        const existingPdfBytes = await fs.readFile(fullPath);

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

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

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
