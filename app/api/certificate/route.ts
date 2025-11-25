import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateCertificate } from '@/lib/pdf-generator';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        const attendee = await prisma.attendee.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!attendee) {
            return NextResponse.json({ error: 'Certificate not found. Please check your email or contact the organizer.' }, { status: 404 });
        }

        // Get template path from config or default
        const config = await prisma.config.findUnique({ where: { key: 'template_path' } });
        // Remove leading slash if present for fs.readFile in lib/pdf-generator which uses path.join(process.cwd(), 'public', templatePath)
        // Actually my lib/pdf-generator uses path.join(process.cwd(), 'public', templatePath).
        // If value is '/uploads/...' then path.join might treat it as absolute if it starts with /.
        // path.join('/foo', '/bar') -> '/bar'.
        // So I should ensure templatePath is relative to public.

        let templatePath = config?.value || 'uploads/certificate_template.pdf';
        if (templatePath.startsWith('/')) {
            templatePath = templatePath.substring(1);
        }

        // Generate PDF
        const pdfBytes = await generateCertificate(attendee.name, templatePath);

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
