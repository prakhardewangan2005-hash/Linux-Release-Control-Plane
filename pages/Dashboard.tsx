import React from 'react';
import { useLoadAction } from '@uibakery/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StageBadge } from '@/components/StageBadge';
import { AlertCircle, CheckCircle, Rocket, XCircle } from 'lucide-react';
import type { DashboardStats, Release, Metric } from '@/types';
import loadDashboardStatsAction from '@/actions/loadDashboardStats';
import loadRecentReleasesAction from '@/actions/loadRecentReleases';
import loadMetricsTimeSeriesAction from '@/actions/loadMetricsTimeSeries';

export function Dashboard() {
  const [stats, statsLoading] = useLoadAction(loadDashboardStatsAction, []);
  const [releases, releasesLoading] = useLoadAction(loadRecentReleasesAction, []);
  const [metrics, metricsLoading] = useLoadAction(loadMetricsTimeSeriesAction, []);

  const dashboardStats = (stats[0] as DashboardStats) || {
    total_releases: 0,
    failed_pipelines: 0,
    open_incidents: 0,
    last_validation_pass: 0,
  };

  const chartData = (metrics as Metric[]).map((m) => ({
    time: new Date(m.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    latency: Number(m.latency_ms),
    errorRate: Number(m.error_rate),
    component: m.component,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Release Overview Dashboard</h2>
        <p className="text-slate-600">Monitor Linux system releases, pipelines, and validation status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Releases</CardTitle>
            <Rocket className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.total_releases}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Pipeline Steps</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold text-red-600">{dashboardStats.failed_pipelines}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.open_incidents}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Validation</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.last_validation_pass > 0 ? 'PASS' : 'N/A'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Metrics (Simulated Signals)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {metricsLoading ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400">Loading metrics...</div>
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400">No metrics data</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="latency" stroke="#3b82f6" name="Latency (ms)" />
                <Line type="monotone" dataKey="errorRate" stroke="#ef4444" name="Error Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Releases</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {releasesLoading ? (
            <div className="text-slate-400">Loading releases...</div>
          ) : (releases as Release[]).length === 0 ? (
            <div className="text-slate-400">No releases found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Linux Version</TableHead>
                  <TableHead>Build ID</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(releases as Release[]).map((release) => (
                  <TableRow key={release.id}>
                    <TableCell className="font-medium">{release.name}</TableCell>
                    <TableCell>{release.linux_version}</TableCell>
                    <TableCell className="font-mono text-xs">{release.build_id}</TableCell>
                    <TableCell>
                      <StageBadge stage={release.stage} />
                    </TableCell>
                    <TableCell>{release.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
