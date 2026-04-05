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
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
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

interface RevenueEntry {
  id: number;
  channelId: number;
  source: string;
  amount: number;
  currency: string;
  date: number;
  description: string;
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

const SOURCES = [
  "adsense",
  "sponsorship",
  "affiliate",
  "merchandise",
  "other",
] as const;

type SourceKind = (typeof SOURCES)[number];

const SOURCE_COLORS: Record<SourceKind, string> = {
  adsense: "text-yellow-400",
  sponsorship: "text-blue-400",
  affiliate: "text-green-400",
  merchandise: "text-purple-400",
  other: "text-muted-foreground",
};

const SOURCE_ICONS: Record<SourceKind, string> = {
  adsense: "📺",
  sponsorship: "🤝",
  affiliate: "🔗",
  merchandise: "👕",
  other: "💰",
};

export default function MonetizationPage() {
  const [channels] = useState<Channel[]>(() =>
    loadFromStorage<Channel[]>("fc_channels", []),
  );
  const [entries, setEntries] = useState<RevenueEntry[]>(() =>
    loadFromStorage<RevenueEntry[]>("fc_revenue", []),
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    channelId: channels.length > 0 ? String(channels[0].id) : "",
    source: "adsense" as SourceKind,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const persist = (updated: RevenueEntry[]) => {
    setEntries(updated);
    saveToStorage("fc_revenue", updated);
  };

  const handleCreate = () => {
    if (!form.amount || Number.isNaN(Number(form.amount))) {
      toast.error("Valid amount required");
      return;
    }
    if (!form.channelId) {
      toast.error("Select a channel");
      return;
    }
    setSaving(true);
    try {
      const newEntry: RevenueEntry = {
        id: Date.now(),
        channelId: Number(form.channelId),
        source: form.source,
        amount: Number(form.amount),
        currency: "USD",
        date: new Date(form.date).getTime(),
        description: form.description,
      };
      persist([newEntry, ...entries]);
      toast.success("Revenue logged!");
      setOpen(false);
      setForm((f) => ({
        ...f,
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    try {
      persist(entries.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } finally {
      setDeleting(null);
    }
  };

  const totalRevenue = entries.reduce((sum, e) => sum + e.amount, 0);
  const bySource = SOURCES.reduce<Record<SourceKind, number>>(
    (acc, s) => {
      acc[s] = entries
        .filter((e) => e.source === s)
        .reduce((sum, e) => sum + e.amount, 0);
      return acc;
    },
    {} as Record<SourceKind, number>,
  );

  const channelName = (id: number) =>
    channels.find((c) => c.id === id)?.name ?? "Unknown";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Monetization
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track all your revenue streams
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="monetization.open_modal_button"
                className="rounded-full btn-primary-gradient border-0 hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" /> Log Revenue
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-md"
              data-ocid="monetization.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  Log Revenue Entry
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <Select
                    value={form.channelId}
                    onValueChange={(v) => setForm({ ...form, channelId: v })}
                  >
                    <SelectTrigger data-ocid="monetization.channel.select">
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
                    <Label>Source</Label>
                    <Select
                      value={form.source}
                      onValueChange={(v) =>
                        setForm({ ...form, source: v as SourceKind })
                      }
                    >
                      <SelectTrigger data-ocid="monetization.source.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Amount (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      data-ocid="monetization.amount.input"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    data-ocid="monetization.date.input"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="e.g. March AdSense payout"
                    data-ocid="monetization.description.textarea"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-ocid="monetization.cancel.button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    data-ocid="monetization.submit_button"
                    className="flex-1 btn-primary-gradient border-0 hover:opacity-90"
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}{" "}
                    Log Revenue
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="col-span-2 md:col-span-1 card-glow bg-card border-border">
            <CardContent className="p-4">
              <DollarSign className="h-5 w-5 text-green-400 mb-2" />
              <p className="text-xl font-bold font-display text-foreground">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          {SOURCES.map((s) => (
            <Card key={s} className="card-glow bg-card border-border">
              <CardContent className="p-4">
                <span className="text-xl mb-2 block">{SOURCE_ICONS[s]}</span>
                <p
                  className={`text-base font-bold font-display ${SOURCE_COLORS[s]}`}
                >
                  ${bySource[s].toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{s}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="card-glow bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Revenue History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="monetization.empty_state"
              >
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">
                  No revenue entries yet
                </p>
              </div>
            ) : (
              <Table data-ocid="monetization.table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Channel
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Source
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Description
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">
                      Amount
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries
                    .sort((a, b) => b.date - a.date)
                    .map((e, i) => (
                      <TableRow
                        key={e.id}
                        data-ocid={`monetization.row.${i + 1}`}
                        className="border-border"
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(e.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-foreground">
                          {channelName(e.channelId)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs capitalize ${SOURCE_COLORS[e.source as SourceKind]}`}
                          >
                            {SOURCE_ICONS[e.source as SourceKind]} {e.source}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.description || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-green-400 text-right">
                          ${e.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            data-ocid={`monetization.delete_button.${i + 1}`}
                            onClick={() => handleDelete(e.id)}
                            disabled={deleting === e.id}
                          >
                            {deleting === e.id ? (
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
