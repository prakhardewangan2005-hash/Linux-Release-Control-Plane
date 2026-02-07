import React, { useState } from 'react';
import { useLoadAction, useMutateAction } from '@uibakery/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { Incident } from '@/types';
import loadIncidentsAction from '@/actions/loadIncidents';
import createIncidentAction from '@/actions/createIncident';

export function Incidents() {
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    severity: 'medium' as Incident['severity'],
    failureMode: 'kernel_regression' as Incident['failure_mode'],
    owner: '',
  });

  const [incidents, loading, error, refresh] = useLoadAction(loadIncidentsAction, [], {
    severity: severityFilter,
    status: statusFilter,
  });
  const [createIncident, creating] = useMutateAction(createIncidentAction);

  const handleCreateIncident = async () => {
    const requestId = `req-${Date.now()}`;
    await createIncident({ ...formData, requestId });
    await refresh();
    setDialogOpen(false);
    setFormData({ title: '', severity: 'medium', failureMode: 'kernel_regression', owner: '' });
  };

  const getSeverityBadge = (severity: Incident['severity']) => {
    const variants = {
      critical: 'bg-red-600 text-white hover:bg-red-600',
      high: 'bg-orange-500 text-white hover:bg-orange-500',
      medium: 'bg-yellow-500 text-white hover:bg-yellow-500',
      low: 'bg-blue-500 text-white hover:bg-blue-500',
    };
    return (
      <Badge className={variants[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: Incident['status']) => {
    const variants = {
      open: 'bg-red-100 text-red-800 hover:bg-red-100',
      investigating: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      resolved: 'bg-green-100 text-green-800 hover:bg-green-100',
    };
    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getFailureModeBadge = (mode: Incident['failure_mode']) => {
    const labels = {
      kernel_regression: 'Kernel Regression',
      driver_incompatibility: 'Driver Incompatibility',
      boot_failure: 'Boot Failure',
      performance_degradation: 'Performance Degradation',
    };
    return (
      <Badge variant="outline">
        {labels[mode]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incident & On-Call View</h2>
          <p className="text-slate-600">Track and manage system incidents and failure modes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Describe the incident"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value as Incident['severity'] })}
                >
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="failureMode">Failure Mode</Label>
                <Select
                  value={formData.failureMode}
                  onValueChange={(value) => setFormData({ ...formData, failureMode: value as Incident['failure_mode'] })}
                >
                  <SelectTrigger id="failureMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kernel_regression">Kernel Regression</SelectItem>
                    <SelectItem value="driver_incompatibility">Driver Incompatibility</SelectItem>
                    <SelectItem value="boot_failure">Boot Failure</SelectItem>
                    <SelectItem value="performance_degradation">Performance Degradation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="owner@amazon.com"
                />
              </div>
              <Button className="w-full" onClick={handleCreateIncident} disabled={creating || !formData.title || !formData.owner}>
                {creating ? 'Creating...' : 'Create Incident'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-slate-400">Loading incidents...</div>
          ) : error ? (
            <div className="text-red-600">Error loading incidents: {error.message}</div>
          ) : (incidents as Incident[]).length === 0 ? (
            <div className="text-slate-400">No incidents found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Failure Mode</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(incidents as Incident[]).map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    <TableCell>{getFailureModeBadge(incident.failure_mode)}</TableCell>
                    <TableCell>{incident.owner}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(incident.created_at).toLocaleString()}
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
