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
import { Lightbulb, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Layout from "../components/Layout";

type IdeaStatus = "idea" | "scripted" | "recorded" | "published" | "archived";

interface ContentIdea {
  id: number;
  title: string;
  description: string;
  tags: string[];
  niche: string;
  status: IdeaStatus;
  createdAt: number;
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

const STATUS_OPTIONS: IdeaStatus[] = [
  "idea",
  "scripted",
  "recorded",
  "published",
  "archived",
];

const STATUS_COLORS: Record<IdeaStatus, string> = {
  idea: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  scripted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  recorded: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

const STATUS_NEXT: Partial<Record<IdeaStatus, IdeaStatus>> = {
  idea: "scripted",
  scripted: "recorded",
  recorded: "published",
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>(() =>
    loadFromStorage<ContentIdea[]>("fc_ideas", []),
  );
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | IdeaStatus>("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    niche: "tech" as NicheKind,
    status: "idea" as IdeaStatus,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState<number | null>(null);

  const persist = (updated: ContentIdea[]) => {
    setIdeas(updated);
    saveToStorage("fc_ideas", updated);
  };

  const handleCreate = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const newIdea: ContentIdea = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        tags,
        niche: form.niche,
        status: form.status,
        createdAt: Date.now(),
      };
      persist([newIdea, ...ideas]);
      toast.success("Idea saved!");
      setOpen(false);
      setForm({
        title: "",
        description: "",
        tags: "",
        niche: "tech",
        status: "idea",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = (idea: ContentIdea) => {
    const next = STATUS_NEXT[idea.status];
    if (!next) return;
    setAdvancing(idea.id);
    try {
      const updated = ideas.map((i) =>
        i.id === idea.id ? { ...i, status: next } : i,
      );
      persist(updated);
      toast.success(`Moved to ${next}`);
    } finally {
      setAdvancing(null);
    }
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    try {
      persist(ideas.filter((i) => i.id !== id));
      toast.success("Idea deleted");
    } finally {
      setDeleting(null);
    }
  };

  const filtered =
    filter === "all" ? ideas : ideas.filter((i) => i.status === filter);
  const counts = STATUS_OPTIONS.reduce<Record<IdeaStatus, number>>(
    (acc, s) => {
      acc[s] = ideas.filter((i) => i.status === s).length;
      return acc;
    },
    {} as Record<IdeaStatus, number>,
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Ideas Vault
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Capture and track your content ideas
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="ideas.open_modal_button"
                className="rounded-full btn-primary-gradient border-0 hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Idea
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-md"
              data-ocid="ideas.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  New Content Idea
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. How I Made $500 with Dividends This Month"
                    data-ocid="ideas.title.input"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the video concept..."
                    data-ocid="ideas.description.textarea"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="passive income, investing, dividends"
                    data-ocid="ideas.tags.input"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Niche</Label>
                    <Select
                      value={form.niche}
                      onValueChange={(v) =>
                        setForm({ ...form, niche: v as NicheKind })
                      }
                    >
                      <SelectTrigger data-ocid="ideas.niche.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NICHES.map((n) => (
                          <SelectItem key={n} value={n} className="capitalize">
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm({ ...form, status: v as IdeaStatus })
                      }
                    >
                      <SelectTrigger data-ocid="ideas.status.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-ocid="ideas.cancel.button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    data-ocid="ideas.submit_button"
                    className="flex-1 btn-primary-gradient border-0 hover:opacity-90"
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}{" "}
                    Save Idea
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            data-ocid="ideas.all.tab"
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filter === "all"
                ? "bg-primary/15 text-primary border-primary/30"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({ideas.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              data-ocid={`ideas.${s}.tab`}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                filter === s
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s} ({counts[s] ?? 0})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20" data-ocid="ideas.empty_state">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No ideas here yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start capturing your content ideas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((idea, i) => (
              <Card
                key={idea.id}
                data-ocid={`ideas.item.${i + 1}`}
                className="card-glow bg-card border-border"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-sm text-foreground">
                          {idea.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[idea.status]}`}
                        >
                          {idea.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground capitalize">
                          {idea.niche}
                        </span>
                      </div>
                      {idea.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {idea.description}
                        </p>
                      )}
                      {idea.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {idea.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {STATUS_NEXT[idea.status] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 border-primary/30 text-primary hover:bg-primary/10"
                          data-ocid={`ideas.advance.button.${i + 1}`}
                          onClick={() => handleAdvance(idea)}
                          disabled={advancing === idea.id}
                        >
                          {advancing === idea.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            `→ ${STATUS_NEXT[idea.status]}`
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive"
                        data-ocid={`ideas.delete_button.${i + 1}`}
                        onClick={() => handleDelete(idea.id)}
                        disabled={deleting === idea.id}
                      >
                        {deleting === idea.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
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
