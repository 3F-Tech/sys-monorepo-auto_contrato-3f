import { EventEmitter } from 'events';

class ProgressTracker extends EventEmitter {
    private static instance: ProgressTracker;

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
        this.emit(`progress:${trackingId}`, data);
    }
}

export const progressTracker = ProgressTracker.getInstance();
