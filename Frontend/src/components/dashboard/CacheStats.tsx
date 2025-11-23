import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Database, TrendingUp, Clock, HardDrive } from 'lucide-react';
import { toneAPI } from '@/lib/api';
import { getCacheStats, clearCache, cleanupExpiredEntries } from '@/lib/cache';
import { toast } from 'sonner';

export function CacheStats() {
  const [backendStats, setBackendStats] = useState<any>(null);
  const [frontendStats, setFrontendStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get backend stats
      const backend = await toneAPI.getCacheStats();
      setBackendStats(backend.stats);

      // Get frontend stats
      const frontend = getCacheStats();
      setFrontendStats(frontend);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      toast.error('Failed to load cache statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearFrontendCache = () => {
    const count = clearCache();
    toast.success(`Cleared ${count} cached entries from browser`);
    loadStats();
  };

  const handleClearBackendCache = async () => {
    try {
      const response = await toneAPI.clearBackendCache();
      toast.success(`Cleared ${response.deleted_count} cached entries from server`);
      loadStats();
    } catch (error) {
      toast.error('Failed to clear backend cache');
    }
  };

  const handleCleanupExpired = () => {
    const count = cleanupExpiredEntries();
    toast.success(`Cleaned up ${count} expired entries`);
    loadStats();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Cache Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Frontend Cache Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Browser Cache (localStorage)
          </CardTitle>
          <CardDescription>
            Instant loading from your browser's storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cached Entries</p>
              <p className="text-2xl font-bold">{frontendStats?.totalEntries || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hits</p>
              <p className="text-2xl font-bold text-green-600">
                {frontendStats?.totalHits || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Oldest Entry</p>
              <p className="text-sm font-medium">
                {frontendStats?.oldestEntry
                  ? new Date(frontendStats.oldestEntry).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Newest Entry</p>
              <p className="text-sm font-medium">
                {frontendStats?.newestEntry
                  ? new Date(frontendStats.newestEntry).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFrontendCache}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Browser Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupExpired}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Cleanup Expired
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backend Cache Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Server Cache (MongoDB)
          </CardTitle>
          <CardDescription>
            Persistent cache shared across all your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cached Entries</p>
              <p className="text-2xl font-bold">{backendStats?.total_entries || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hits</p>
              <p className="text-2xl font-bold text-green-600">
                {backendStats?.total_hits || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Calls Saved</p>
              <p className="text-2xl font-bold text-blue-600">
                {backendStats?.estimated_api_calls_saved || 0}
              </p>
            </div>
          </div>

          {backendStats?.estimated_api_calls_saved > 0 && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Excellent cache performance!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You've saved {backendStats.estimated_api_calls_saved} API calls by using cached responses.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearBackendCache}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Server Cache
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">How caching works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Identical requests are cached for 30 days</li>
                <li>Browser cache provides instant responses</li>
                <li>Server cache works across all your devices</li>
                <li>Saves API quota and improves response time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
