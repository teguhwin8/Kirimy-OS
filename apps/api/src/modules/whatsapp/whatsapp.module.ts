import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { EventsModule } from '../events/events.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, EventsModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
