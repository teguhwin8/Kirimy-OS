import { Injectable, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  ConnectionState,
} from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import * as path from 'path';
import * as fs from 'fs';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private socket: WASocket;

  constructor(private readonly eventsGateway: EventsGateway) {}

  async onModuleInit() {
    await this.connectToWhatsApp();
  }

  async connectToWhatsApp() {
    const authPath = path.resolve(__dirname, '../../../../wa_sessions');
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    this.socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    this.socket.ev.on(
      'connection.update',
      (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log('\nScan QR Code ini pake WhatsApp di HP:');
          qrcode.generate(qr, { small: true });

          // TAMBAHAN: Kirim QR ke Frontend via WebSocket
          this.eventsGateway.emit('qr', qr);
          this.eventsGateway.emit('status', 'scan_qr');
        }

        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as { output?: { statusCode?: number } })
              ?.output?.statusCode !== DisconnectReason.loggedOut;

          console.log(
            'Koneksi terputus karena:',
            lastDisconnect?.error,
            ', Reconnecting:',
            shouldReconnect,
          );

          if (shouldReconnect) {
            void this.connectToWhatsApp();
          }

          this.eventsGateway.emit('status', 'disconnected');
        }

        if (connection === 'open') {
          console.log('\n✅ BERHASIL TERHUBUNG KE WHATSAPP! 🚀\n');

          this.eventsGateway.emit('status', 'connected');
          this.eventsGateway.emit('qr', null);
        }
      },
    );

    this.socket.ev.on('creds.update', () => {
      void saveCreds();
    });
  }

  async sendText(to: string, message: string) {
    if (!this.socket) {
      throw new Error('WhatsApp belum terhubung!');
    }

    let formattedTo = to;
    if (!to.endsWith('@s.whatsapp.net')) {
      formattedTo = to.replace(/[^0-9]/g, '');
      if (formattedTo.startsWith('0')) {
        formattedTo = '62' + formattedTo.slice(1);
      }
      formattedTo = formattedTo + '@s.whatsapp.net';
    }

    await this.socket.sendMessage(formattedTo, { text: message });
    console.log(`Terkirim ke ${to}: ${message}`);
  }
}
