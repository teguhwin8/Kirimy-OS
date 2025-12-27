import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private lastStatus: string = 'disconnected';
  private lastQr: string | null = null;

  handleConnection(client: Socket) {
    console.log(`Client baru connect: ${client.id}`);

    client.emit('status', this.lastStatus);

    if (this.lastStatus === 'scan_qr' && this.lastQr) {
      client.emit('qr', this.lastQr);
    }
  }

  emit(event: string, data: any) {
    if (event === 'status') {
      // FIX: Tambahkan 'as string' agar aman
      this.lastStatus = data as string;

      if (data === 'connected') {
        this.lastQr = null;
      }
    }

    if (event === 'qr') {
      // FIX: Tambahkan 'as string' agar aman
      this.lastQr = data as string;
      this.lastStatus = 'scan_qr';
    }

    this.server.emit(event, data);
  }
}
