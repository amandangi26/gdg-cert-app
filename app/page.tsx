'use client';

import { useState } from 'react';
import { Search, Download, AlertCircle, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;

    setLoading(true);
    setError('');
    setDownloadUrl(null);
    setAttendeeName('');

    try {
      const res = await fetch(`/api/certificate?ticketId=${encodeURIComponent(ticketId)}`);

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);

        const disposition = res.headers.get('Content-Disposition');
        let filename = 'Certificate.pdf';
        if (disposition && disposition.includes('filename=')) {
          filename = disposition.split('filename=')[1].replace(/"/g, '');
        }
        setAttendeeName(filename.replace('GDG_Certificate_', '').replace('.pdf', '').replace(/_/g, ' '));

      } else {
        const data = await res.json();
        setError(data.error || 'Certificate not found.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden flex flex-col">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-home.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Navbar / Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* GDG Logo Placeholder - Replace with actual SVG if available or keep this styled text */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#4285F4]"></div>
              <div className="w-2 h-2 rounded-full bg-[#EA4335]"></div>
              <div className="w-2 h-2 rounded-full bg-[#FBBC05]"></div>
              <div className="w-2 h-2 rounded-full bg-[#34A853]"></div>
            </div>
            <span className="text-white font-bold tracking-wide text-sm">GDG Cloud Motihari</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">

        <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left Column: Text */}
          <div className="text-center md:text-left space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#34A853]">Certificate</span><br />
              Is Ready
            </h1>
            <p className="text-lg text-gray-200 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Thank you for participating in our event. Enter your registered email address to download your official certificate of participation.
            </p>
          </div>

          {/* Right Column: Form */}
          <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-100">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="ticketId" className="block text-sm font-medium text-gray-200 mb-2 ml-1">
                  Ticket Order ID
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="ticketId"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="e.g. GOOGE25273XXXX"
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all outline-none text-white placeholder-gray-400 group-hover:bg-white/10"
                    required
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4 group-focus-within:text-[#4285F4] transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Find Certificate
                    <Sparkles className="w-4 h-4 text-[#FBBC05]" />
                  </>
                )}
              </button>
            </form>

            {/* Results */}
            <div className="mt-8 min-h-[100px]">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {downloadUrl && (
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center animate-in fade-in slide-in-from-top-2">
                  <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Certificate Found!</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Ready for <span className="font-semibold text-white">{attendeeName}</span>
                  </p>

                  <a
                    href={downloadUrl}
                    download={`GDG_Certificate_${attendeeName.replace(/\s+/g, '_') || '2025'}.pdf`}
                    className="inline-flex items-center gap-2 bg-[#34A853] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2d9147] transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/30 w-full justify-center"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </a>
                </div>
              )}

              {!error && !downloadUrl && !loading && (
                <div className="text-center text-gray-400 text-sm py-4">
                  Enter your Ticket ID to get started
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-gray-400">© 2025 GDG Cloud Motihari. All rights reserved.</p>
      </footer>
    </div>
  );
}
