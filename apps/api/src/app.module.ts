import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq'; // Import ini
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { MessageModule } from './modules/message/message.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    // Config koneksi ke Redis
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost', // Ambil dari ENV, fallback ke localhost
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    WhatsappModule,
    MessageModule,
    EventsModule,
  ],
  providers: [],
})
export class AppModule {}
