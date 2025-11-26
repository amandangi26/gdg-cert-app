'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Users, Trash2, RefreshCw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Attendee {
    id: string;
    name: string;
    ticketId: string;
    createdAt: string;
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [stats, setStats] = useState({ total: 0 });

    const router = useRouter();

    const fetchAttendees = async () => {
        setLoadingAttendees(true);
        try {
            const res = await fetch('/api/attendees');
            if (res.ok) {
                const data = await res.json();
                setAttendees(data.attendees);
                setStats({ total: data.count });
            } else if (res.status === 401) {
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch attendees');
        } finally {
            setLoadingAttendees(false);
        }
    };

    useEffect(() => {
        fetchAttendees();
    }, []);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                (e.target as HTMLFormElement).reset();
                fetchAttendees(); // Refresh list
            } else {
                setMessage({ type: 'error', text: data.error || 'Upload failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this attendee?')) return;

        try {
            const res = await fetch(`/api/attendees?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAttendees();
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            alert('Error deleting');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <span className="font-bold text-xl text-gray-800">GDG Admin</span>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/logout', { method: 'POST' });
                                    router.push('/login');
                                    router.refresh();
                                }}
                                className="text-gray-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Attendees</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                    </div>
                    {/* Add more stats here if needed */}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'upload' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Upload Data
                        {activeTab === 'upload' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'manage' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Manage Attendees
                        {activeTab === 'manage' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'upload' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Upload Files</h2>
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Attendee Data (Excel/CSV)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-gray-50">
                                    <input
                                        type="file"
                                        name="file"
                                        accept=".xlsx, .xls, .csv"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Certificate Template (PDF)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-gray-50">
                                    <input
                                        type="file"
                                        name="template"
                                        accept=".pdf"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Upload className="w-5 h-5" /> Upload Data</>}
                            </button>
                        </form>

                        {message && (
                            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {message.type === 'success' ? <Check className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                                <p>{message.text}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Registered Attendees</h2>
                            <button onClick={fetchAttendees} className="text-gray-500 hover:text-blue-600 transition-colors">
                                <RefreshCw className={`w-5 h-5 ${loadingAttendees ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Ticket ID</th>
                                        <th className="px-6 py-4">Date Added</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {attendees.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                No attendees found. Upload a file to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        attendees.map((attendee) => (
                                            <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{attendee.name}</td>
                                                <td className="px-6 py-4 font-mono text-xs">{attendee.ticketId}</td>
                                                <td className="px-6 py-4">{new Date(attendee.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(attendee.id)}
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
