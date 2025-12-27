import { Body, Controller, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('message')
export class MessageController {
  constructor(@InjectQueue('message-queue') private messageQueue: Queue) {}

  @Post('send')
  async sendMessage(@Body() body: { to: string; message: string }) {
    const { to, message } = body;

    // Masukkan ke antrean (bukan langsung kirim)
    await this.messageQueue.add('send-text', {
      to,
      message,
    });

    return {
      success: true,
      info: 'Pesan masuk antrean',
      data: { to, message },
    };
  }
}
