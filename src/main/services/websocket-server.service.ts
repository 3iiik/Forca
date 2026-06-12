import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';

export type WsMessageType =
  | 'zone:start'
  | 'zone:end'
  | 'zone:pause'
  | 'zone:resume'
  | 'handshake'
  | 'client:pause'
  | 'client:resume'
  | 'client:end';

export type ClientCommand = 'pause' | 'resume' | 'end';

export interface WsPayload {
  sites?: string[];
  zoneName?: string;
  remaining?: number;
}

export interface WsMessage {
  type: WsMessageType;
  payload: WsPayload;
}

export class WebSocketServerService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private port: number;

  getActiveZoneState?: () => WsPayload | null;

  onClientCommand?: (command: ClientCommand, payload: WsPayload) => void;

  constructor(port: number = 7432) {
    this.port = port;
  }

  start(): void {
    if (this.wss) return;

    this.wss = new WebSocketServer({ host: '127.0.0.1', port: this.port });

    this.wss.on('listening', () => {
      logger.info(`WebSocket server listening on 127.0.0.1:${this.port}`);
    });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      logger.info(`Extension connected (${this.clients.size} total clients)`);

      ws.on('message', (data: Buffer) => {
        try {
          const msg: WsMessage = JSON.parse(data.toString());
          switch (msg.type) {
            case 'handshake': {
              logger.info('Extension handshake received');
              ws.send(JSON.stringify({ type: 'handshake:ack', payload: {} }));
              const activeState = this.getActiveZoneState?.();
              if (activeState) {
                ws.send(JSON.stringify({ type: 'zone:start', payload: activeState }));
              }
              break;
            }

            case 'client:pause':
              logger.info('Client command: pause');
              this.onClientCommand?.('pause', msg.payload || {});
              break;

            case 'client:resume':
              logger.info('Client command: resume');
              this.onClientCommand?.('resume', msg.payload || {});
              break;

            case 'client:end':
              logger.info('Client command: end');
              this.onClientCommand?.('end', msg.payload || {});
              break;
          }
        } catch {
          logger.warn('Invalid message from extension');
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info(`Extension disconnected (${this.clients.size} remaining)`);
      });

      ws.on('error', (err) => {
        logger.error('WebSocket client error:', err);
        this.clients.delete(ws);
      });
    });

    this.wss.on('error', (err) => {
      logger.error('WebSocket server error:', err);
    });
  }

  broadcast(type: WsMessageType, payload: WsPayload = {}): void {
    const message: WsMessage = { type, payload };
    const data = JSON.stringify(message);
    let sent = 0;
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
        sent++;
      }
    }
    if (sent > 0) {
      logger.info(`Broadcast ${type} to ${sent} client(s)`);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  stop(): void {
    if (this.wss) {
      for (const client of this.clients) {
        client.close();
      }
      this.clients.clear();
      this.wss.close();
      this.wss = null;
      logger.info('WebSocket server stopped');
    }
  }

  restart(): void {
    logger.info('Restarting WebSocket server...');
    this.stop();
    this.start();
    logger.info('WebSocket server restarted');
  }
}
