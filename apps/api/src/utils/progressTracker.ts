import { EventEmitter } from 'events';

class ProgressTracker extends EventEmitter {
    private static instance: ProgressTracker;
    private history: Map<string, any[]> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): ProgressTracker {
        if (!ProgressTracker.instance) {
            ProgressTracker.instance = new ProgressTracker();
        }
        return ProgressTracker.instance;
    }

    public emitProgress(trackingId: string, data: { status: string; progress: number; log?: string; step?: string; error?: any }) {
        // Armazenar no histórico para que novos ouvintes (SSE recém-conectados) recebam as mensagens perdidas
        if (!this.history.has(trackingId)) {
            this.history.set(trackingId, []);
        }
        this.history.get(trackingId)?.push(data);
        
        this.emit(`progress:${trackingId}`, data);
    }

    public getHistory(trackingId: string): any[] {
        return this.history.get(trackingId) || [];
    }

    public clearHistory(trackingId: string) {
        this.history.delete(trackingId);
    }
}

export const progressTracker = ProgressTracker.getInstance();

