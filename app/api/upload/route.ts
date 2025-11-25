import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import * as XLSX from 'xlsx';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const template = formData.get('template') as File | null;

        if (!file && !template) {
            return NextResponse.json({ error: 'No files received.' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

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
                // Expecting Column 1: Name, Column 2: Email
                // Row might be empty or have fewer columns
                if (!row || row.length < 2) continue;

                const name = row[0]?.toString().trim();
                const email = row[1]?.toString().trim().toLowerCase();

                if (name && email) {
                    await prisma.attendee.upsert({
                        where: { email },
                        update: { name },
                        create: { name, email },
                    });
                    count++;
                }
            }
            message += `Processed ${count} attendees. `;
        }

        if (template) {
            const bytes = await template.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(path.join(uploadDir, 'certificate_template.pdf'), buffer);

            // Save config to DB just in case we want to track it, or just rely on FS
            await prisma.config.upsert({
                where: { key: 'template_path' },
                update: { value: '/uploads/certificate_template.pdf' },
                create: { key: 'template_path', value: '/uploads/certificate_template.pdf' },
            });
            message += 'Template uploaded successfully.';
        }

        return NextResponse.json({ message, success: true });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
