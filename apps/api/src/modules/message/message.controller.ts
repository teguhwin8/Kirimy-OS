import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApiKeyGuard } from 'src/common/guards/api-key/api-key.guard';

interface SendMessageDto {
  to: string;
  type: 'text' | 'image';
  message?: string;
  url?: string;
  caption?: string;
}

@UseGuards(ApiKeyGuard)
@Controller('message')
export class MessageController {
  constructor(@InjectQueue('message-queue') private messageQueue: Queue) {}

  @Post('send')
  async sendMessage(@Body() body: SendMessageDto) {
    const { to, type, message, url, caption } = body;

    if (!to || !type) {
      throw new BadRequestException('Field "to" dan "type" wajib diisi!');
    }
    if (type === 'text' && !message) {
      throw new BadRequestException(
        'Field "message" wajib diisi untuk tipe text!',
      );
    }
    if (type === 'image' && !url) {
      throw new BadRequestException(
        'Field "url" wajib diisi untuk tipe image!',
      );
    }

    await this.messageQueue.add('send-message', {
      type,
      to,
      message,
      url,
      caption,
    });

    return {
      success: true,
      info: 'Pesan masuk antrean',
      data: { to, type },
    };
  }
}
