import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Eye,
  FileText,
  Lightbulb,
  TrendingUp,
  Tv2,
  Users,
  Video,
} from "lucide-react";
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

interface VideoScript {
  id: number;
  title: string;
  niche: string;
  tone: string;
  topic: string;
  hook: { title: string; content: string };
  intro: { title: string; content: string };
  body: { title: string; content: string };
  callToAction: { title: string; content: string };
  createdAt: number;
}

interface ContentIdea {
  id: number;
  title: string;
  description: string;
  tags: string[];
  niche: string;
  status: string;
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

export default function DashboardPage() {
  const navigate = useNavigate();

  const channels = loadFromStorage<Channel[]>("fc_channels", []);
  const scripts = loadFromStorage<VideoScript[]>("fc_scripts", []);
  const ideas = loadFromStorage<ContentIdea[]>("fc_ideas", []);
  const revenue = loadFromStorage<RevenueEntry[]>("fc_revenue", []);

  const totalRevenue = revenue.reduce((sum, e) => sum + e.amount, 0);

  const statCards = [
    {
      label: "Channels",
      value: channels.length.toLocaleString(),
      icon: Tv2,
      color: "text-primary",
    },
    {
      label: "Scripts",
      value: scripts.length.toLocaleString(),
      icon: FileText,
      color: "text-accent",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Videos Published",
      value: scripts.length.toLocaleString(),
      icon: Video,
      color: "text-yellow-400",
    },
    {
      label: "Content Ideas",
      value: ideas.length.toLocaleString(),
      icon: Lightbulb,
      color: "text-purple-400",
    },
  ];

  const quickActions = [
    { label: "Manage Channels", icon: Tv2, href: "/channels" as const },
    { label: "Generate Script", icon: FileText, href: "/scripts" as const },
    { label: "Add Idea", icon: Lightbulb, href: "/ideas" as const },
    { label: "Log Revenue", icon: DollarSign, href: "/monetization" as const },
    { label: "View Analytics", icon: BarChart3, href: "/analytics" as const },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your faceless channel business at a glance
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
            <TrendingUp className="h-3 w-3 text-green-400" />
            <span>Local data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map(({ label, value, icon: Icon, color }) => (
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

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ label, icon: Icon, href }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                data-ocid={`dashboard.${label.toLowerCase().replace(/\s+/g, "_")}.button`}
                className="border-border text-foreground/80 hover:text-primary hover:border-primary/50 transition-colors"
                onClick={() => navigate({ to: href })}
              >
                <Icon className="mr-1.5 h-3.5 w-3.5" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              My Channels
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              data-ocid="dashboard.channels.link"
              onClick={() => navigate({ to: "/channels" })}
            >
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {channels.length === 0 ? (
              <div
                className="col-span-2 text-center py-10 text-muted-foreground"
                data-ocid="dashboard.channels.empty_state"
              >
                <Tv2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  No channels yet.{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => navigate({ to: "/channels" })}
                  >
                    Create one
                  </button>
                </p>
              </div>
            ) : (
              channels.slice(0, 4).map((ch, i) => (
                <Card
                  key={ch.id}
                  data-ocid={`dashboard.channels.item.${i + 1}`}
                  className="card-glow bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate({ to: "/channels" })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Tv2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {ch.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {ch.niche} · {ch.uploadFrequency}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Scripts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              data-ocid="dashboard.scripts.link"
              onClick={() => navigate({ to: "/scripts" })}
            >
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {scripts.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="dashboard.scripts.empty_state"
            >
              <FileText className="h-7 w-7 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                No scripts yet.{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => navigate({ to: "/scripts" })}
                >
                  Generate one
                </button>
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {scripts.slice(0, 3).map((s, i) => (
                <Card
                  key={s.id}
                  data-ocid={`dashboard.scripts.item.${i + 1}`}
                  className="card-glow bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate({ to: "/scripts" })}
                >
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm text-foreground truncate mb-1">
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {s.niche} · {s.tone}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Eye className="h-3 w-3" />
          <span>All data is stored locally on your device</span>
        </div>
      </div>
    </Layout>
  );
}
