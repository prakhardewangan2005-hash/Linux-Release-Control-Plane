import React, { useState } from 'react';
import { useLoadAction } from '@uibakery/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import type { Metric } from '@/types';
import loadMetricsAction from '@/actions/loadMetrics';

export function Metrics() {
  const [componentFilter, setComponentFilter] = useState<string>('');
  const [metrics, loading, error] = useLoadAction(loadMetricsAction, [], {
    component: componentFilter,
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Timestamp', 'Component', 'Latency (ms)', 'Error Rate (%)', 'CPU (%)'],
      ...(metrics as Metric[]).map((m) => [
        new Date(m.ts).toISOString(),
        m.component,
        m.latency_ms.toString(),
        m.error_rate.toString(),
        m.cpu_pct.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isHighLatency = (latency: number) => latency > 100;
  const isHighErrorRate = (errorRate: number) => Number(errorRate) > 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Metrics</h2>
          <p className="text-slate-600">Monitor system performance across kernel, driver, and service components</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={componentFilter} onValueChange={setComponentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Components" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Components</SelectItem>
              <SelectItem value="kernel">Kernel</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCSV}
            disabled={(metrics as Metric[]).length === 0}
            type="button"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics (Simulated Signals)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-slate-400">Loading metrics...</div>
          ) : error ? (
            <div className="text-red-600">Error loading metrics: {error.message}</div>
          ) : (metrics as Metric[]).length === 0 ? (
            <div className="text-slate-400">No metrics data found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Latency (ms)</TableHead>
                  <TableHead>Error Rate (%)</TableHead>
                  <TableHead>CPU (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(metrics as Metric[]).map((metric) => {
                  const highLatency = isHighLatency(Number(metric.latency_ms));
                  const highError = isHighErrorRate(Number(metric.error_rate));
                  const hasIssue = highLatency || highError;

                  return (
                    <TableRow key={metric.id} className={hasIssue ? 'bg-red-50' : ''}>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(metric.ts).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-medium capitalize">{metric.component}</TableCell>
                      <TableCell className={highLatency ? 'text-red-700 font-semibold' : ''}>
                        {Number(metric.latency_ms).toFixed(1)}
                      </TableCell>
                      <TableCell className={highError ? 'text-red-700 font-semibold' : ''}>
                        {Number(metric.error_rate).toFixed(2)}
                      </TableCell>
                      <TableCell>{Number(metric.cpu_pct).toFixed(1)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
