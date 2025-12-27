import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway], // <--- PENTING: Biar WhatsappService bisa pakai ini
})
export class EventsModule {}
