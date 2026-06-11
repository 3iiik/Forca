import { logger } from '../utils/logger';

export class BlockingService {
  private sitesToBlock: string[] = [];

  setWindow(_win: Electron.BrowserWindow): void {
  }

  async blockSites(sites: string[]): Promise<void> {
    this.sitesToBlock = [...new Set(sites.map(s => s.trim().toLowerCase()).filter(Boolean))];
    logger.info(`Queueing ${this.sitesToBlock.length} sites for extension blocking`);
  }

  async unblockSites(): Promise<void> {
    this.sitesToBlock = [];
    logger.info('All sites unblocked');
  }

  getBlockedSites(): string[] {
    return this.sitesToBlock;
  }

  cleanup(): void {
    this.sitesToBlock = [];
  }
}
