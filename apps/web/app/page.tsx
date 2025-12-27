'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // Hapus import type 'Socket' karena tidak dipakai state-nya
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  // HAPUS state socket, kita tidak butuh simpan di state untuk sekarang
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<string>('disconnected');

  useEffect(() => {
    // 1. Connect ke Backend
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket Server');
    });

    // 2. Dengerin Event 'qr' dari Backend
    newSocket.on('qr', (data) => {
      console.log('Dapet QR Code baru!');
      setQrCode(data);
      setStatus('scan_qr');
    });

    // 3. Dengerin Event 'status' (connected/disconnected)
    newSocket.on('status', (data) => {
      console.log('Status Update:', data);
      if (data === 'connected') {
        setQrCode(''); // Hapus QR kalau udah connect
        setStatus('connected');
      }
    });

    // HAPUS setSocket(newSocket) -> Ini penyebab error utama tadi

    // Cleanup pas unmount (pindah halaman/close tab)
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          <p className="font-bold text-xl">KirimyOS Dashboard 🚀</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-5 p-10 border rounded-2xl bg-white shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Device Status</h2>

        {/* STATUS: CONNECTED */}
        {status === 'connected' && (
          <div className="flex flex-col items-center text-green-600 animate-bounce">
            <span className="text-6xl">✅</span>
            <p className="mt-4 text-xl font-semibold">WhatsApp Terhubung!</p>
            <p className="text-sm text-gray-500">Siap mengirim pesan via API.</p>
          </div>
        )}

        {/* STATUS: SCAN QR */}
        {status === 'scan_qr' && qrCode && (
          <div className="flex flex-col items-center">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <QRCodeSVG value={qrCode} size={256} />
            </div>
            <p className="mt-6 text-center text-gray-600">
              Buka WhatsApp di HP {'>'} Titik Tiga {'>'} Linked Devices <br />
              <span className="font-bold text-black">Scan QR Code di atas</span>
            </p>
          </div>
        )}

        {/* STATUS: LOADING / DISCONNECTED */}
        {status === 'disconnected' && (
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-4xl">🔄</span>
            <p className="mt-4">Menunggu koneksi ke Server...</p>
          </div>
        )}
      </div>
    </main>
  );
}