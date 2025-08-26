import { cache } from '../cache/redis-cache';

// Performance metrics interfaces
interface RequestMetrics {
    route: string;
    method: string;
    statusCode: number;
    duration: number;
    timestamp: number;
    userAgent?: string;
    ip?: string;
    cacheHit?: boolean;
    dbQueries?: number;
    dbQueryTime?: number;
    memoryUsage?: number;
    errorType?: string;
}

interface AggregatedMetrics {
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    requestsPerMinute: number;
    slowRequests: number;
    dbQueryStats: {
        totalQueries: number;
        averageQueryTime: number;
        slowQueries: number;
    };
    memoryStats: {
        averageUsage: number;
        peakUsage: number;
    };
    statusCodeDistribution: Record<string, number>;
    routeStats: Record<string, {
        count: number;
        avgDuration: number;
        errorRate: number;
    }>;
}

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
        database: boolean;
        cache: boolean;
        memory: boolean;
        responseTime: boolean;
        errorRate: boolean;
    };
    metrics: AggregatedMetrics;
    lastChecked: Date;
}

interface AlertRule {
    name: string;
    condition: (metrics: AggregatedMetrics) => boolean;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cooldown: number; // minutes
}

class PerformanceMonitor {
    private metrics: RequestMetrics[] = [];
    private alerts: Array<{ rule: AlertRule; lastTriggered: number }> = [];
    private readonly maxMetrics = 10000;
    private readonly retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    private cleanupInterval: NodeJS.Timeout;

    // Thresholds for health checks
    private readonly thresholds = {
        slowRequestMs: 1000,
        maxErrorRate: 5, // 5%
        maxMemoryMB: 512,
        maxP95ResponseTime: 2000,
        maxDbQueryTime: 500
    };

    // Default alert rules
    private alertRules: AlertRule[] = [
        {
            name: 'High Error Rate',
            condition: (m) => m.errorRate > 10,
            message: 'Error rate exceeded 10%',
            severity: 'high',
            cooldown: 15
        },
        {
            name: 'Slow Response Time',
            condition: (m) => m.p95ResponseTime > 3000,
            message: 'P95 response time exceeded 3 seconds',
            severity: 'medium',
            cooldown: 10
        },
        {
            name: 'Low Cache Hit Rate',
            condition: (m) => m.cacheHitRate < 50 && m.totalRequests > 100,
            message: 'Cache hit rate below 50%',
            severity: 'medium',
            cooldown: 30
        },
        {
            name: 'High Database Query Time',
            condition: (m) => m.dbQueryStats.averageQueryTime > 1000,
            message: 'Average database query time exceeded 1 second',
            severity: 'high',
            cooldown: 15
        },
        {
            name: 'Memory Usage High',
            condition: (m) => m.memoryStats.averageUsage > 400,
            message: 'Average memory usage exceeded 400MB',
            severity: 'medium',
            cooldown: 20
        }
    ];

    constructor() {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 60 * 1000); // Cleanup every hour

        // Initialize alert tracking
        this.alerts = this.alertRules.map(rule => ({
            rule,
            lastTriggered: 0
        }));
    }

    /**
     * Record a request metric
     */
    recordRequest(metric: RequestMetrics): void {
        metric.timestamp = Date.now();
        
        // Add memory usage if available
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memUsage = process.memoryUsage();
            metric.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
        }

        this.metrics.push(metric);

        // Maintain max metrics limit
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }

        // Log slow requests immediately
        if (metric.duration > this.thresholds.slowRequestMs) {
            console.warn(`🐌 Slow request: ${metric.method} ${metric.route} - ${metric.duration}ms`);
        }

        // Log errors
        if (metric.statusCode >= 400) {
            console.error(`❌ Error request: ${metric.method} ${metric.route} - ${metric.statusCode} - ${metric.duration}ms`, {
                errorType: metric.errorType,
                userAgent: metric.userAgent,
                ip: metric.ip
            });
        }

        // Check alerts periodically (every 100 requests)
        if (this.metrics.length % 100 === 0) {
            this.checkAlerts();
        }
    }

    /**
     * Get aggregated metrics for a time period
     */
    getMetrics(minutes: number = 60): AggregatedMetrics {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

        if (recentMetrics.length === 0) {
            return this.getEmptyMetrics();
        }

        // Calculate response time percentiles
        const responseTimes = recentMetrics.map(m => m.duration).sort((a, b) => a - b);
        const p95Index = Math.floor(responseTimes.length * 0.95);
        const p99Index = Math.floor(responseTimes.length * 0.99);

        // Calculate aggregated values
        const totalRequests = recentMetrics.length;
        const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
        const p95ResponseTime = responseTimes[p95Index] || 0;
        const p99ResponseTime = responseTimes[p99Index] || 0;

        const errorRequests = recentMetrics.filter(m => m.statusCode >= 400).length;
        const errorRate = (errorRequests / totalRequests) * 100;

        const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
        const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

        const requestsPerMinute = totalRequests / minutes;
        const slowRequests = recentMetrics.filter(m => m.duration > this.thresholds.slowRequestMs).length;

        // Database query stats
        const dbMetrics = recentMetrics.filter(m => m.dbQueries && m.dbQueryTime);
        const totalDbQueries = dbMetrics.reduce((sum, m) => sum + (m.dbQueries || 0), 0);
        const totalDbQueryTime = dbMetrics.reduce((sum, m) => sum + (m.dbQueryTime || 0), 0);
        const averageQueryTime = totalDbQueries > 0 ? totalDbQueryTime / totalDbQueries : 0;
        const slowQueries = dbMetrics.filter(m => (m.dbQueryTime || 0) > this.thresholds.maxDbQueryTime).length;

        // Memory stats
        const memoryMetrics = recentMetrics.filter(m => m.memoryUsage).map(m => m.memoryUsage!);
        const averageMemoryUsage = memoryMetrics.length > 0 ? 
            memoryMetrics.reduce((sum, mem) => sum + mem, 0) / memoryMetrics.length : 0;
        const peakMemoryUsage = Math.max(...memoryMetrics, 0);

        // Status code distribution
        const statusCodeDistribution: Record<string, number> = {};
        recentMetrics.forEach(m => {
            const statusGroup = `${Math.floor(m.statusCode / 100)}xx`;
            statusCodeDistribution[statusGroup] = (statusCodeDistribution[statusGroup] || 0) + 1;
        });

        // Route stats
        const routeStats: Record<string, { count: number; avgDuration: number; errorRate: number }> = {};
        const routeGroups = recentMetrics.reduce((groups, m) => {
            const key = `${m.method} ${m.route}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
            return groups;
        }, {} as Record<string, RequestMetrics[]>);

        Object.entries(routeGroups).forEach(([route, metrics]) => {
            const count = metrics.length;
            const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / count;
            const errors = metrics.filter(m => m.statusCode >= 400).length;
            const errorRate = (errors / count) * 100;

            routeStats[route] = { count, avgDuration, errorRate };
        });

        return {
            totalRequests,
            averageResponseTime: Math.round(averageResponseTime),
            p95ResponseTime: Math.round(p95ResponseTime),
            p99ResponseTime: Math.round(p99ResponseTime),
            errorRate: Math.round(errorRate * 100) / 100,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100,
            requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
            slowRequests,
            dbQueryStats: {
                totalQueries: totalDbQueries,
                averageQueryTime: Math.round(averageQueryTime),
                slowQueries
            },
            memoryStats: {
                averageUsage: Math.round(averageMemoryUsage),
                peakUsage: Math.round(peakMemoryUsage)
            },
            statusCodeDistribution,
            routeStats
        };
    }

    /**
     * Get system health status
     */
    async getHealthStatus(): Promise<HealthStatus> {
        const metrics = this.getMetrics(15); // Last 15 minutes
        const cacheHealth = await cache.healthCheck();

        const checks = {
            database: true, // This would need to be implemented with actual DB health check
            cache: cacheHealth.redis || cacheHealth.memory,
            memory: metrics.memoryStats.averageUsage < this.thresholds.maxMemoryMB,
            responseTime: metrics.p95ResponseTime < this.thresholds.maxP95ResponseTime,
            errorRate: metrics.errorRate < this.thresholds.maxErrorRate
        };

        // Determine overall status
        const healthyChecks = Object.values(checks).filter(Boolean).length;
        let status: 'healthy' | 'degraded' | 'unhealthy';

        if (healthyChecks === Object.keys(checks).length) {
            status = 'healthy';
        } else if (healthyChecks >= Object.keys(checks).length * 0.6) {
            status = 'degraded';
        } else {
            status = 'unhealthy';
        }

        return {
            status,
            checks,
            metrics,
            lastChecked: new Date()
        };
    }

    /**
     * Check alert rules and trigger alerts
     */
    private checkAlerts(): void {
        const metrics = this.getMetrics(10); // Last 10 minutes
        const now = Date.now();

        this.alerts.forEach(alert => {
            const { rule, lastTriggered } = alert;
            const cooldownMs = rule.cooldown * 60 * 1000;

            // Check if cooldown period has passed
            if (now - lastTriggered < cooldownMs) return;

            // Check if condition is met
            if (rule.condition(metrics)) {
                this.triggerAlert(rule, metrics);
                alert.lastTriggered = now;
            }
        });
    }

    /**
     * Trigger an alert
     */
    private triggerAlert(rule: AlertRule, metrics: AggregatedMetrics): void {
        const alertData = {
            rule: rule.name,
            severity: rule.severity,
            message: rule.message,
            timestamp: new Date().toISOString(),
            metrics: {
                totalRequests: metrics.totalRequests,
                errorRate: metrics.errorRate,
                averageResponseTime: metrics.averageResponseTime,
                p95ResponseTime: metrics.p95ResponseTime,
                cacheHitRate: metrics.cacheHitRate
            }
        };

        // Log alert
        console.warn(`🚨 ALERT [${rule.severity.toUpperCase()}]: ${rule.message}`, alertData);

        // Here you could implement various alert channels:
        // - Email notifications
        // - Slack/Discord webhooks
        // - SMS alerts
        // - PagerDuty integration
        // - Database logging for alert history

        // Store alert in cache for dashboard
        this.storeAlert(alertData);
    }

    /**
     * Store alert for dashboard access
     */
    private async storeAlert(alertData: any): Promise<void> {
        try {
            const alertKey = `alerts:${Date.now()}`;
            await cache.set(alertKey, alertData, 24 * 60 * 60 * 1000); // 24 hours

            // Maintain alerts list
            const alertsList = await cache.get<string[]>('alerts:list') || [];
            alertsList.push(alertKey);
            
            // Keep only last 100 alerts
            if (alertsList.length > 100) {
                const removed = alertsList.splice(0, alertsList.length - 100);
                // Delete old alerts
                await Promise.all(removed.map(key => cache.delete(key)));
            }
            
            await cache.set('alerts:list', alertsList, 24 * 60 * 60 * 1000);
        } catch (error) {
            console.error('Failed to store alert:', error);
        }
    }

    /**
     * Get recent alerts
     */
    async getRecentAlerts(limit: number = 20): Promise<any[]> {
        try {
            const alertsList = await cache.get<string[]>('alerts:list') || [];
            const recentAlertKeys = alertsList.slice(-limit);
            const alerts = await cache.mget(recentAlertKeys);
            return alerts.filter(Boolean);
        } catch (error) {
            console.error('Failed to get recent alerts:', error);
            return [];
        }
    }

    /**
     * Clean up old metrics
     */
    private cleanup(): void {
        const cutoff = Date.now() - this.retentionPeriod;
        const initialCount = this.metrics.length;
        
        this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
        
        const cleaned = initialCount - this.metrics.length;
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} old performance metrics`);
        }
    }

    /**
     * Get empty metrics object
     */
    private getEmptyMetrics(): AggregatedMetrics {
        return {
            totalRequests: 0,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            errorRate: 0,
            cacheHitRate: 0,
            requestsPerMinute: 0,
            slowRequests: 0,
            dbQueryStats: {
                totalQueries: 0,
                averageQueryTime: 0,
                slowQueries: 0
            },
            memoryStats: {
                averageUsage: 0,
                peakUsage: 0
            },
            statusCodeDistribution: {},
            routeStats: {}
        };
    }

    /**
     * Export metrics for external monitoring systems
     */
    exportMetrics(format: 'prometheus' | 'json' = 'json'): string {
        const metrics = this.getMetrics(60);

        if (format === 'prometheus') {
            // Export in Prometheus format
            return [
                `# HELP api_requests_total Total number of API requests`,
                `# TYPE api_requests_total counter`,
                `api_requests_total ${metrics.totalRequests}`,
                ``,
                `# HELP api_request_duration_ms Average request duration in milliseconds`,
                `# TYPE api_request_duration_ms gauge`,
                `api_request_duration_ms ${metrics.averageResponseTime}`,
                ``,
                `# HELP api_error_rate Error rate percentage`,
                `# TYPE api_error_rate gauge`,
                `api_error_rate ${metrics.errorRate}`,
                ``,
                `# HELP api_cache_hit_rate Cache hit rate percentage`,
                `# TYPE api_cache_hit_rate gauge`,
                `api_cache_hit_rate ${metrics.cacheHitRate}`,
            ].join('\n');
        }

        return JSON.stringify(metrics, null, 2);
    }

    /**
     * Cleanup resources
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.metrics = [];
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export helper function for recording requests
export function recordRequest(
    route: string,
    method: string,
    statusCode: number,
    duration: number,
    options: {
        userAgent?: string;
        ip?: string;
        cacheHit?: boolean;
        dbQueries?: number;
        dbQueryTime?: number;
        errorType?: string;
    } = {}
): void {
    performanceMonitor.recordRequest({
        route,
        method,
        statusCode,
        duration,
        timestamp: Date.now(),
        ...options
    });
}

export default performanceMonitor;
