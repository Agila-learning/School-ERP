import { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';

// @desc    System health check
// @route   GET /api/v1/super-admin/system/health
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    // Database health
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'OPERATIONAL' : dbState === 2 ? 'CONNECTING' : 'DOWN';

    // Server metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();

    const services = [
      { name: 'Backend API', status: 'OPERATIONAL', latency: 0 },
      { name: 'Database (MongoDB)', status: dbStatus, latency: 0 },
      { name: 'Authentication', status: 'OPERATIONAL', latency: 0 },
      { name: 'File Storage', status: 'OPERATIONAL', latency: 0 },
    ];

    // Quick DB ping
    const pingStart = Date.now();
    try {
      await mongoose.connection.db?.admin().ping();
      services[1].latency = Date.now() - pingStart;
    } catch {
      services[1].status = 'DEGRADED';
    }

    const overallStatus = services.every(s => s.status === 'OPERATIONAL') ? 'OPERATIONAL'
      : services.some(s => s.status === 'DOWN') ? 'DEGRADED' : 'PARTIAL';

    res.json({
      success: true,
      data: {
        overallStatus,
        services,
        server: {
          uptimeSeconds: Math.round(uptime),
          uptimeFormatted: formatUptime(uptime),
          nodeVersion: process.version,
          platform: os.platform(),
          cpuLoad: cpuLoad[0].toFixed(2),
          memoryUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          memoryTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          systemFreeMB: Math.round(freeMemory / 1024 / 1024),
          systemTotalMB: Math.round(totalMemory / 1024 / 1024),
        },
        checkedAt: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Health check failed' });
  }
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
