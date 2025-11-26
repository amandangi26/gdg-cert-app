import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const template = formData.get('template') as File | null;

        if (!file && !template) {
            return NextResponse.json({ error: 'No files received.' }, { status: 400 });
        }

        let message = '';

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

            let count = 0;
            for (const row of data) {
                // Expecting Column 1: Ticket Order ID, Column 2: Name
                // Row might be empty or have fewer columns
                if (!row || row.length < 2) continue;

                const ticketId = row[0]?.toString().trim();
                let name = row[1]?.toString().trim();

                if (name && ticketId) {
                    // Convert name to Title Case
                    name = name.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                    await prisma.attendee.upsert({
                        where: { ticketId },
                        update: { name },
                        create: { name, ticketId },
                    });
                    count++;
                }
            }
            message += `Processed ${count} attendees. `;
        }

        if (template) {
            const bytes = await template.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Convert to Base64 string to store in DB
            // This avoids writing to the read-only filesystem on Vercel
            const base64Template = buffer.toString('base64');

            await prisma.config.upsert({
                where: { key: 'template_data' },
                update: { value: base64Template },
                create: { key: 'template_data', value: base64Template },
            });
            message += 'Template uploaded successfully (stored in database).';
        }

        return NextResponse.json({ message, success: true });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
