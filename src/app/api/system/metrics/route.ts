import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

export async function GET(req: NextRequest) {
    try {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        const nodeVersion = process.version;

        // Basic connectivity test to Firestore
        let dbStatus = 'disconnected';
        try {
            const testQuery = await getDocs(query(collection(db, 'clients'), limit(1)));
            if (testQuery) dbStatus = 'connected';
        } catch (e) {
            console.error('Firestore connection check failed:', e);
            dbStatus = 'error';
        }

        return NextResponse.json({
            uptime: {
                seconds: Math.floor(uptime),
                human: formatUptime(uptime)
            },
            memory: {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
                rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
            },
            environment: {
                node: nodeVersion,
                platform: process.platform,
                mode: process.env.NODE_ENV
            },
            services: {
                firestore: dbStatus,
                gemini: process.env.GEMINI_API_KEY ? 'active' : 'missing_key'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch metrics', detail: error.message }, { status: 500 });
    }
}

function formatUptime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}
