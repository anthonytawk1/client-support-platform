import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userId: string;

  handleConnection(@ConnectedSocket() client: Socket) {
    this.userId = client.id;
    this.server.emit('welcome', `${client.id},Welcome`);
  }

  handleDisconnect(client: Socket) {
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
      client.join(data.userId);
  }

  notifyUser(userId: any, data: any) {
    
    this.server.to(userId).emit('statusChanged', data);
}
}
