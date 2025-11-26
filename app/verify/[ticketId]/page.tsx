import prisma from '@/lib/db';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ ticketId: string }>;
}

export default async function VerifyPage({ params }: PageProps) {
    const { ticketId } = await params;

    const attendee = await prisma.attendee.findUnique({
        where: { ticketId: ticketId },
    });

    if (!attendee) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Certificate</h1>
                    <p className="text-gray-500 mb-8">
                        We could not find a valid certificate for Ticket ID: <span className="font-mono font-bold text-gray-700">{ticketId}</span>
                    </p>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-green-100">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verified Certificate</h1>
                <p className="text-green-600 font-medium mb-8">
                    This certificate is valid and authentic.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-8">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Name</p>
                        <p className="text-lg font-bold text-gray-900">{attendee.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ticket ID</p>
                        <p className="text-lg font-mono text-gray-700">{attendee.ticketId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Event</p>
                        <p className="text-gray-700">DevFest Motihari 2025 (GDG Cloud Motihari)</p>
                    </div>
                </div>

                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                    Go to Home
                </Link>
            </div>
        </div>
    );
}
