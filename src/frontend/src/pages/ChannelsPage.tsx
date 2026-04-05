import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Plus, Trash2, Tv2 } from "lucide-react";
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

const NICHES = [
  "finance",
  "tech",
  "education",
  "gaming",
  "health",
  "lifestyle",
  "food",
  "travel",
  "entertainment",
  "other",
] as const;

type NicheKind = (typeof NICHES)[number];

const NICHE_LABELS: Record<NicheKind, string> = {
  finance: "Finance",
  tech: "Technology",
  education: "Education",
  gaming: "Gaming",
  health: "Health",
  lifestyle: "Lifestyle",
  food: "Food",
  travel: "Travel",
  entertainment: "Entertainment",
  other: "Other",
};

const FREQ_OPTIONS = [
  "Daily",
  "3x/week",
  "2x/week",
  "Weekly",
  "Bi-weekly",
  "Monthly",
];

interface ChannelForm {
  name: string;
  niche: NicheKind;
  description: string;
  uploadFrequency: string;
  targetAudience: string;
}

const defaultForm: ChannelForm = {
  name: "",
  niche: "tech",
  description: "",
  uploadFrequency: "3x/week",
  targetAudience: "",
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(() =>
    loadFromStorage<Channel[]>("fc_channels", []),
  );
  const [open, setOpen] = useState(false);
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [form, setForm] = useState<ChannelForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const persist = (updated: Channel[]) => {
    setChannels(updated);
    saveToStorage("fc_channels", updated);
  };

  const openCreate = () => {
    setEditChannel(null);
    setForm(defaultForm);
    setOpen(true);
  };

  const openEdit = (ch: Channel) => {
    setEditChannel(ch);
    setForm({
      name: ch.name,
      niche: ch.niche as NicheKind,
      description: ch.description,
      uploadFrequency: ch.uploadFrequency,
      targetAudience: ch.targetAudience,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Channel name is required");
      return;
    }
    setSaving(true);
    try {
      if (editChannel) {
        const updated = channels.map((c) =>
          c.id === editChannel.id ? { ...c, ...form } : c,
        );
        persist(updated);
        toast.success("Channel updated");
      } else {
        const newChannel: Channel = { id: Date.now(), ...form };
        persist([...channels, newChannel]);
        toast.success("Channel created");
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    try {
      persist(channels.filter((c) => c.id !== id));
      toast.success("Channel deleted");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Channels
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your faceless YouTube channels
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                data-ocid="channels.open_modal_button"
                className="rounded-full btn-primary-gradient border-0 hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" /> New Channel
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-md"
              data-ocid="channels.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editChannel ? "Edit Channel" : "New Channel"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Channel Name</Label>
                  <Input
                    placeholder="e.g. Tech Insights Daily"
                    data-ocid="channels.name.input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Niche</Label>
                  <Select
                    value={form.niche}
                    onValueChange={(v) =>
                      setForm({ ...form, niche: v as NicheKind })
                    }
                  >
                    <SelectTrigger data-ocid="channels.niche.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {NICHE_LABELS[n]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What is this channel about?"
                    data-ocid="channels.description.textarea"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Upload Frequency</Label>
                  <Select
                    value={form.uploadFrequency}
                    onValueChange={(v) =>
                      setForm({ ...form, uploadFrequency: v })
                    }
                  >
                    <SelectTrigger data-ocid="channels.frequency.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQ_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Target Audience</Label>
                  <Input
                    placeholder="e.g. Young professionals aged 25-35"
                    data-ocid="channels.audience.input"
                    value={form.targetAudience}
                    onChange={(e) =>
                      setForm({ ...form, targetAudience: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-ocid="channels.cancel.button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    data-ocid="channels.submit_button"
                    className="flex-1 btn-primary-gradient border-0 hover:opacity-90"
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editChannel ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-20" data-ocid="channels.empty_state">
            <Tv2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No channels yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first faceless YouTube channel
            </p>
            <Button
              onClick={openCreate}
              className="btn-primary-gradient border-0 hover:opacity-90 rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Channel
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {channels.map((ch, i) => (
              <Card
                key={ch.id}
                data-ocid={`channels.item.${i + 1}`}
                className="card-glow bg-card border-border"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Tv2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">
                          {ch.name}
                        </h3>
                        <span className="text-xs text-muted-foreground capitalize">
                          {ch.niche}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary"
                        data-ocid={`channels.edit_button.${i + 1}`}
                        onClick={() => openEdit(ch)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        data-ocid={`channels.delete_button.${i + 1}`}
                        onClick={() => handleDelete(ch.id)}
                        disabled={deleting === ch.id}
                      >
                        {deleting === ch.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {ch.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {ch.description}
                    </p>
                  )}
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">
                      📅 {ch.uploadFrequency}
                    </span>
                    <span className="text-muted-foreground">
                      👥 {ch.targetAudience || "General"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
