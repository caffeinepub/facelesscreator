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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileText, Loader2, Plus, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Layout from "../components/Layout";

interface ScriptSection {
  title: string;
  content: string;
}

interface VideoScript {
  id: number;
  title: string;
  niche: string;
  tone: string;
  topic: string;
  hook: ScriptSection;
  intro: ScriptSection;
  body: ScriptSection;
  callToAction: ScriptSection;
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

const TONES = [
  "educational",
  "entertaining",
  "motivational",
  "informative",
  "tutorial",
  "review",
  "storytelling",
  "commentary",
  "other",
] as const;

type NicheKind = (typeof NICHES)[number];
type ToneKind = (typeof TONES)[number];

function generateSections(
  topic: string,
  niche: string,
  tone: string,
): {
  hook: ScriptSection;
  intro: ScriptSection;
  body: ScriptSection;
  callToAction: ScriptSection;
} {
  return {
    hook: {
      title: "Hook",
      content: `Did you know that ${topic}? In the next few minutes, I'll show you exactly why this changes everything — and how you can use it to your advantage starting today.`,
    },
    intro: {
      title: "Introduction",
      content: `Welcome back. Today we're diving deep into ${topic}. Whether you're completely new to ${niche} or you already have some experience, this is going to be incredibly valuable. I've spent hours researching this, so you don't have to. Let's get into it.`,
    },
    body: {
      title: "Main Content",
      content: `Let's break this down into key points.\n\nFirst, it's crucial to understand that ${topic} is reshaping the ${niche} space in ways most people haven't noticed yet. The early movers are already seeing massive results.\n\nSecond, the most important thing to understand here is the core principle: consistency beats perfection every single time. The channels blowing up right now in ${niche} aren't the ones with the best equipment — they're the ones showing up week after week.\n\nThird — and this is what separates the top ${tone} creators from everyone else — they obsess over the first 30 seconds. If you hook your viewer, they stay. If you lose them, no algorithm can save you.\n\nFinally, here's what the top creators in ${niche} do differently: they repurpose everything. One video becomes 10 pieces of content across different platforms.`,
    },
    callToAction: {
      title: "Call to Action",
      content: `If this gave you value, smash that like button — it genuinely helps more people find this content. Subscribe if you haven't already; we drop new ${niche} videos every week. And drop a comment below: what's your biggest challenge with ${topic}? I read every single one. See you in the next one.`,
    },
  };
}

const toneColor = (tone: string) => {
  const colors: Record<string, string> = {
    educational: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    entertaining: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    motivational: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    tutorial: "bg-green-500/10 text-green-400 border-green-500/20",
    informative: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return colors[tone] ?? "bg-muted text-muted-foreground border-border";
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<VideoScript[]>(() =>
    loadFromStorage<VideoScript[]>("fc_scripts", []),
  );
  const [open, setOpen] = useState(false);
  const [viewScript, setViewScript] = useState<VideoScript | null>(null);
  const [form, setForm] = useState({
    title: "",
    niche: "tech" as NicheKind,
    tone: "educational" as ToneKind,
    topic: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const persist = (updated: VideoScript[]) => {
    setScripts(updated);
    saveToStorage("fc_scripts", updated);
  };

  const handleCreate = () => {
    if (!form.title.trim() || !form.topic.trim()) {
      toast.error("Title and topic are required");
      return;
    }
    setSaving(true);
    try {
      const sections = generateSections(form.topic, form.niche, form.tone);
      const newScript: VideoScript = {
        id: Date.now(),
        title: form.title,
        niche: form.niche,
        tone: form.tone,
        topic: form.topic,
        hook: sections.hook,
        intro: sections.intro,
        body: sections.body,
        callToAction: sections.callToAction,
        createdAt: Date.now(),
      };
      persist([newScript, ...scripts]);
      toast.success("Script generated!");
      setOpen(false);
      setForm({ title: "", niche: "tech", tone: "educational", topic: "" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    try {
      persist(scripts.filter((s) => s.id !== id));
      toast.success("Script deleted");
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
              Script Generator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-powered video scripts for your channels
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="scripts.open_modal_button"
                className="rounded-full btn-primary-gradient border-0 hover:opacity-90"
              >
                <Zap className="mr-2 h-4 w-4" /> Generate Script
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-md"
              data-ocid="scripts.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  Generate New Script
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Script Title</Label>
                  <Input
                    placeholder="e.g. 5 Passive Income Ideas for 2025"
                    data-ocid="scripts.title.input"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Topic / Main Subject</Label>
                  <Input
                    placeholder="e.g. passive income through dividend investing"
                    data-ocid="scripts.topic.input"
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
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
                      <SelectTrigger data-ocid="scripts.niche.select">
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
                    <Label>Tone</Label>
                    <Select
                      value={form.tone}
                      onValueChange={(v) =>
                        setForm({ ...form, tone: v as ToneKind })
                      }
                    >
                      <SelectTrigger data-ocid="scripts.tone.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t}
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
                    data-ocid="scripts.cancel.button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    data-ocid="scripts.submit_button"
                    className="flex-1 btn-primary-gradient border-0 hover:opacity-90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" /> Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog
          open={!!viewScript}
          onOpenChange={(o) => !o && setViewScript(null)}
        >
          <DialogContent
            className="bg-card border-border max-w-2xl max-h-[80vh]"
            data-ocid="scripts.view.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display">
                {viewScript?.title}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {viewScript?.topic} ·{" "}
                <span className="capitalize">{viewScript?.tone}</span> ·{" "}
                <span className="capitalize">{viewScript?.niche}</span>
              </p>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {viewScript &&
                [
                  {
                    section: viewScript.hook,
                    color: "border-blue-500/30 bg-blue-500/5",
                  },
                  {
                    section: viewScript.intro,
                    color: "border-green-500/30 bg-green-500/5",
                  },
                  {
                    section: viewScript.body,
                    color: "border-yellow-500/30 bg-yellow-500/5",
                  },
                  {
                    section: viewScript.callToAction,
                    color: "border-purple-500/30 bg-purple-500/5",
                  },
                ].map(({ section, color }) => (
                  <div
                    key={section.title}
                    className={`rounded-lg border p-4 mb-3 ${color}`}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {section.title}
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {scripts.length === 0 ? (
          <div className="text-center py-20" data-ocid="scripts.empty_state">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No scripts yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Generate your first AI-powered video script
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="btn-primary-gradient border-0 hover:opacity-90 rounded-full"
            >
              <Zap className="mr-2 h-4 w-4" /> Generate Script
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {scripts.map((s, i) => (
              <Card
                key={s.id}
                data-ocid={`scripts.item.${i + 1}`}
                className="card-glow bg-card border-border"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {s.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {s.topic}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-primary"
                        data-ocid={`scripts.view.button.${i + 1}`}
                        onClick={() => setViewScript(s)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive"
                        data-ocid={`scripts.delete_button.${i + 1}`}
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                      >
                        {deleting === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border capitalize ${toneColor(s.tone)}`}
                    >
                      {s.tone}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground capitalize">
                      {s.niche}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {s.hook.content}
                    </p>
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
