import React, { useState } from 'react';
import { useLoadAction } from '@uibakery/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Pipeline, Release } from '@/types';
import loadAllReleasesAction from '@/actions/loadAllReleases';
import loadPipelinesAction from '@/actions/loadPipelines';

export function Pipelines() {
  const [releaseFilter, setReleaseFilter] = useState<string>('all');
  const [releases] = useLoadAction(loadAllReleasesAction, [], { stage: null });
  const [pipelines, loading, error] = useLoadAction(loadPipelinesAction, [], {
    releaseId: releaseFilter === 'all' ? null : parseInt(releaseFilter),
  });

  const getStatusBadge = (status: Pipeline['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800 hover:bg-green-100',
      fail: 'bg-red-100 text-red-800 hover:bg-red-100',
      running: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      pending: 'bg-slate-100 text-slate-800 hover:bg-slate-100',
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CI/CD Pipeline Status</h2>
          <p className="text-slate-600">Monitor build, test, and validation pipeline execution</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Filter by release:</span>
          <Select value={releaseFilter} onValueChange={setReleaseFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Releases</SelectItem>
              {(releases as Release[]).map((release) => (
                <SelectItem key={release.id} value={release.id.toString()}>
                  {release.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Steps</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-slate-400">Loading pipelines...</div>
          ) : error ? (
            <div className="text-red-600">Error loading pipelines: {error.message}</div>
          ) : (pipelines as Pipeline[]).length === 0 ? (
            <div className="text-slate-400">No pipeline data found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step Name</TableHead>
                  <TableHead>Release ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(pipelines as Pipeline[]).map((pipeline) => (
                  <TableRow
                    key={pipeline.id}
                    className={pipeline.status === 'fail' ? 'bg-red-50' : ''}
                  >
                    <TableCell className="font-medium">{pipeline.step_name}</TableCell>
                    <TableCell className="font-mono text-xs">{pipeline.release_id}</TableCell>
                    <TableCell>{getStatusBadge(pipeline.status)}</TableCell>
                    <TableCell>
                      {pipeline.duration_sec ? `${pipeline.duration_sec}s` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(pipeline.created_at).toLocaleString()}
                    </TableCell>
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
