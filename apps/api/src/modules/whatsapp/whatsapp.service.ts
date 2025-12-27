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

@Injectable()
export class WhatsappService implements OnModuleInit {
  private socket: WASocket;

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
        }

        if (connection === 'open') {
          console.log('\n✅ BERHASIL TERHUBUNG KE WHATSAPP! 🚀\n');
        }
      },
    );

    this.socket.ev.on('creds.update', () => {
      void saveCreds();
    });
  }
}
