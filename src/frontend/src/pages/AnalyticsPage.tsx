import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Eye,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Layout from "../components/Layout";

interface Channel {
  id: number;
  name: string;
  niche: string;
  description: string;
  uploadFrequency: string;
  targetAudience: string;
}

interface AnalyticsSnapshot {
  id: number;
  channelId: number;
  subscribers: number;
  totalViews: number;
  monthlyViews: number;
  monthlyRevenue: number;
  date: number;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function AnalyticsPage() {
  const [channels] = useState<Channel[]>(() =>
    loadFromStorage<Channel[]>("fc_channels", []),
  );
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>(() =>
    loadFromStorage<AnalyticsSnapshot[]>("fc_analytics", []),
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    channelId: channels.length > 0 ? String(channels[0].id) : "",
    subscribers: "",
    totalViews: "",
    monthlyViews: "",
    monthlyRevenue: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const persist = (updated: AnalyticsSnapshot[]) => {
    setSnapshots(updated);
    saveToStorage("fc_analytics", updated);
  };

  const handleCreate = () => {
    if (!form.channelId) {
      toast.error("Select a channel");
      return;
    }
    if (!form.subscribers || !form.totalViews) {
      toast.error("Subscribers and views are required");
      return;
    }
    setSaving(true);
    try {
      const newSnap: AnalyticsSnapshot = {
        id: Date.now(),
        channelId: Number(form.channelId),
        subscribers: Math.round(Number(form.subscribers)),
        totalViews: Math.round(Number(form.totalViews)),
        monthlyViews: Math.round(Number(form.monthlyViews) || 0),
        monthlyRevenue: Number(form.monthlyRevenue) || 0,
        date: new Date(form.date).getTime(),
      };
      persist([newSnap, ...snapshots]);
      toast.success("Snapshot recorded!");
      setOpen(false);
      setForm((f) => ({
        ...f,
        subscribers: "",
        totalViews: "",
        monthlyViews: "",
        monthlyRevenue: "",
        date: new Date().toISOString().split("T")[0],
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    try {
      persist(snapshots.filter((s) => s.id !== id));
      toast.success("Snapshot deleted");
    } finally {
      setDeleting(null);
    }
  };

  const channelName = (id: number) =>
    channels.find((c) => c.id === id)?.name ?? "Unknown";

  const latestSubs =
    snapshots.length > 0 ? Math.max(...snapshots.map((s) => s.subscribers)) : 0;
  const latestViews =
    snapshots.length > 0 ? Math.max(...snapshots.map((s) => s.totalViews)) : 0;
  const totalMonthlyRev = snapshots.reduce(
    (sum, s) => sum + s.monthlyRevenue,
    0,
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your channel growth over time
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="analytics.open_modal_button"
                className="rounded-full btn-primary-gradient border-0 hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" /> Record Snapshot
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-md"
              data-ocid="analytics.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  New Analytics Snapshot
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <Select
                    value={form.channelId}
                    onValueChange={(v) => setForm({ ...form, channelId: v })}
                  >
                    <SelectTrigger data-ocid="analytics.channel.select">
                      <SelectValue
                        placeholder={
                          channels.length === 0
                            ? "Create a channel first"
                            : "Select channel"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((ch) => (
                        <SelectItem key={ch.id} value={String(ch.id)}>
                          {ch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Subscribers</Label>
                    <Input
                      type="number"
                      placeholder="12500"
                      data-ocid="analytics.subscribers.input"
                      value={form.subscribers}
                      onChange={(e) =>
                        setForm({ ...form, subscribers: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total Views</Label>
                    <Input
                      type="number"
                      placeholder="450000"
                      data-ocid="analytics.totalviews.input"
                      value={form.totalViews}
                      onChange={(e) =>
                        setForm({ ...form, totalViews: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly Views</Label>
                    <Input
                      type="number"
                      placeholder="35000"
                      data-ocid="analytics.monthlyviews.input"
                      value={form.monthlyViews}
                      onChange={(e) =>
                        setForm({ ...form, monthlyViews: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly Revenue ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="320.00"
                      data-ocid="analytics.monthlyrevenue.input"
                      value={form.monthlyRevenue}
                      onChange={(e) =>
                        setForm({ ...form, monthlyRevenue: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    data-ocid="analytics.date.input"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-ocid="analytics.cancel.button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    data-ocid="analytics.submit_button"
                    className="flex-1 btn-primary-gradient border-0 hover:opacity-90"
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}{" "}
                    Record
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Peak Subscribers",
              value: latestSubs.toLocaleString(),
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Peak Total Views",
              value: latestViews.toLocaleString(),
              icon: Eye,
              color: "text-accent",
            },
            {
              label: "Monthly Revenue",
              value: `$${totalMonthlyRev.toFixed(2)}`,
              icon: TrendingUp,
              color: "text-green-400",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="card-glow bg-card border-border">
              <CardContent className="p-4">
                <Icon className={`h-5 w-5 ${color} mb-2`} />
                <p className="text-xl font-bold font-display text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="card-glow bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Snapshot History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {snapshots.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="analytics.empty_state"
              >
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">
                  No snapshots recorded yet
                </p>
              </div>
            ) : (
              <Table data-ocid="analytics.table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Channel
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Subscribers
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Total Views
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Monthly Views
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Monthly Rev.
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots
                    .sort((a, b) => b.date - a.date)
                    .map((s, i) => (
                      <TableRow
                        key={s.id}
                        data-ocid={`analytics.row.${i + 1}`}
                        className="border-border"
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(s.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-foreground">
                          {channelName(s.channelId)}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-primary">
                          {s.subscribers.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-foreground">
                          {s.totalViews.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-foreground">
                          {s.monthlyViews.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-green-400">
                          ${s.monthlyRevenue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            data-ocid={`analytics.delete_button.${i + 1}`}
                            onClick={() => handleDelete(s.id)}
                            disabled={deleting === s.id}
                          >
                            {deleting === s.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
