import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApiKeyGuard } from '../../common/guards/api-key/api-key.guard';
import { SendMessageDto } from './send-message.dto'; // Import DTO baru
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger'; // Import Swagger Decorator

@ApiTags('Message') // Label di Swagger
@ApiSecurity('x-api-key') // Tanda gembok di Swagger
@UseGuards(ApiKeyGuard)
@Controller('message')
export class MessageController {
  constructor(@InjectQueue('message-queue') private messageQueue: Queue) {}

  @Post('send')
  @ApiOperation({ summary: 'Kirim pesan Text atau Gambar ke antrean' })
  async sendMessage(@Body() body: SendMessageDto) {
    const { to, type, message, url, caption } = body;

    // Validasi sederhana
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

    // Masukkan ke antrean
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
