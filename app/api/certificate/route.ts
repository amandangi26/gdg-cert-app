import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateCertificate } from '@/lib/pdf-generator';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
        return NextResponse.json({ error: 'Ticket Order ID is required' }, { status: 400 });
    }

    try {
        const attendee = await prisma.attendee.findUnique({
            where: { ticketId: ticketId.trim() },
        });

        if (!attendee) {
            return NextResponse.json({
                error: 'It seems you didn’t check-in at the event, so no certificate is found. Please enter the valid ticket order ID you checked in with.'
            }, { status: 404 });
        }

        // 1. Try to get template from DB (Base64)
        const config = await prisma.config.findUnique({ where: { key: 'template_data' } });

        let templateBytes: Uint8Array;

        if (config && config.value) {
            // Convert Base64 string back to Buffer
            templateBytes = new Uint8Array(Buffer.from(config.value, 'base64'));
        } else {
            // 2. Fallback to default file in public/uploads
            // Note: In Vercel, process.cwd() is the root. public files are usually copied to the output.
            // However, reading from public/ at runtime in serverless can be tricky.
            // Best practice is to use path.join(process.cwd(), 'public', ...)
            const defaultPath = path.join(process.cwd(), 'public', 'uploads', 'certificate_template.pdf');
            try {
                const fileBuffer = await fs.readFile(defaultPath);
                templateBytes = new Uint8Array(fileBuffer);
            } catch (err) {
                console.error('Failed to read default template:', err);
                return NextResponse.json({ error: 'Certificate template not found.' }, { status: 500 });
            }
        }

        // Generate PDF
        const pdfBytes = await generateCertificate(attendee.name, templateBytes);

        // Return PDF
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="GDG_Certificate_${attendee.name.replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Certificate error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
