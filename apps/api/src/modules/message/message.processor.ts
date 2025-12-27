import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WhatsappService } from '../whatsapp/whatsapp.service';

interface SendMessageJobData {
  to: string;
  message: string;
}

@Processor('message-queue')
export class MessageProcessor extends WorkerHost {
  constructor(private readonly whatsappService: WhatsappService) {
    super();
  }

  async process(job: Job<SendMessageJobData>): Promise<any> {
    console.log(`Sedang memproses job ${job.id}...`);

    const { to, message } = job.data;

    await this.whatsappService.sendText(to, message);

    return { status: 'sent', to };
  }
}
