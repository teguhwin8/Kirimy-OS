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
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private socket: WASocket;

  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly httpService: HttpService,
  ) {}

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

    this.socket.ev.on('messages.upsert', (update) => {
      void (async () => {
        const { messages, type } = update;

        if (type !== 'notify') return;

        for (const msg of messages) {
          if (!msg.key.fromMe) {
            console.log('📩 Pesan masuk:', msg);

            const webhookUrl = process.env.WEBHOOK_URL;

            if (webhookUrl) {
              try {
                const text =
                  msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text ||
                  msg.message?.imageMessage?.caption ||
                  '';

                const payload = {
                  from: msg.key.remoteJid,
                  name: msg.pushName,
                  message: text,
                  timestamp: msg.messageTimestamp,
                  full_data: msg,
                };

                await firstValueFrom(
                  this.httpService.post(webhookUrl, payload),
                );
                console.log(`✅ Webhook forwarded to ${webhookUrl}`);
              } catch (error) {
                if (error instanceof Error) {
                  console.error('❌ Gagal hit webhook:', error.message);
                } else {
                  console.error('❌ Gagal hit webhook:', error);
                }
              }
            }
          }
        }
      })();
    });

    this.socket.ev.on(
      'connection.update',
      (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log('\nScan QR Code ini pake WhatsApp di HP:');
          qrcode.generate(qr, { small: true });

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

    const formattedTo = this.formatPhone(to);

    await this.socket.sendMessage(formattedTo, { text: message });
    console.log(`Terkirim ke ${to}: ${message}`);
  }

  async sendPhoto(to: string, url: string, caption?: string) {
    if (!this.socket) {
      throw new Error('WhatsApp belum terhubung!');
    }

    const formattedTo = this.formatPhone(to);

    await this.socket.sendMessage(formattedTo, {
      image: { url: url },
      caption: caption || '',
    });

    console.log(`Gambar terkirim ke ${to}`);
  }

  private formatPhone(phone: string): string {
    let formatted = phone.replace(/[^0-9]/g, '');
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.slice(1);
    }
    if (!formatted.endsWith('@s.whatsapp.net')) {
      formatted += '@s.whatsapp.net';
    }
    return formatted;
  }
}
