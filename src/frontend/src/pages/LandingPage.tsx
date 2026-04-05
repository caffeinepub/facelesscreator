import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  FileText,
  Lightbulb,
  Play,
  TrendingUp,
  Tv2,
  Youtube,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "AI Script Generator",
      desc: "Generate complete, engaging video scripts in seconds. Structured hooks, intros, body content, and CTAs — ready to record.",
    },
    {
      icon: Lightbulb,
      title: "Content Ideas Vault",
      desc: "Never run out of ideas. Capture, tag, and track your content pipeline from idea to published — all in one place.",
    },
    {
      icon: DollarSign,
      title: "Monetization Tracker",
      desc: "Track AdSense, sponsorships, affiliate income, and merch revenue across all your channels with detailed breakdowns.",
    },
  ];

  const toolList = [
    { icon: Tv2, label: "Multi-Channel Manager" },
    { icon: FileText, label: "Script Generator" },
    { icon: Lightbulb, label: "Ideas Vault" },
    { icon: BarChart3, label: "Growth Analytics" },
    { icon: DollarSign, label: "Revenue Dashboard" },
    { icon: TrendingUp, label: "Progress Tracker" },
  ];

  const pricingFeatures = [
    "Unlimited channels",
    "AI script generation",
    "Revenue tracking",
    "Content calendar",
    "Analytics dashboard",
    "Local data storage",
    "No monthly fees",
    "No registration needed",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="nav-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg btn-primary-gradient flex items-center justify-center glow-blue">
              <span className="text-white font-bold text-sm font-display">
                F
              </span>
            </div>
            <span className="font-bold font-display text-foreground">
              FacelessCreator
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#tools"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              data-ocid="nav.dashboard.link"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              className="rounded-full btn-primary-gradient border-0 hover:opacity-90 hidden sm:flex"
              data-ocid="landing.get_started.primary_button"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-6">
              <Zap className="h-3 w-3" />
              No registration required
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground leading-tight mb-5">
              Automate Your Success with{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.60 0.22 258), oklch(0.55 0.18 192))",
                }}
              >
                Faceless YouTube
              </span>{" "}
              Channels
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Build, manage, and scale multiple faceless YouTube channels with
              AI-powered scripts, content planning, and revenue tracking — no
              sign-up needed, start instantly.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="landing.start_free.primary_button"
                className="rounded-full btn-primary-gradient border-0 hover:opacity-90 h-12 px-7 text-base font-semibold glow-blue"
              >
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="landing.see_dashboard.button"
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Play className="h-3 w-3 fill-current" />
                </div>
                See Dashboard
              </button>
            </div>
            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10 flex-wrap">
              {["No registration", "Free forever", "Instant access"].map(
                (t) => (
                  <div
                    key={t}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    {t}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        {/* Decorative blob */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, oklch(0.55 0.18 192 / 0.4) 0%, transparent 70%)",
            transform: "translate(20%, -20%)",
          }}
        />
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
              All-in-One Content Automation
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to build a profitable faceless YouTube
              business, from first idea to first dollar.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="card-glow rounded-2xl p-6 bg-card group hover:border-primary/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-display text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {desc}
                </p>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                  onClick={() => navigate({ to: "/dashboard" })}
                >
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools + CTA */}
      <section id="tools" className="py-20 bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Tool List */}
            <div className="card-glow rounded-2xl p-7 bg-card">
              <h3 className="text-xl font-bold font-display text-foreground mb-5">
                Features & Tools
              </h3>
              <div className="space-y-3">
                {toolList.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/90">{label}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="landing.explore_features.button"
                className="mt-6 w-full rounded-full btn-primary-gradient border-0 hover:opacity-90"
              >
                Explore All Features
              </Button>
            </div>
            {/* Right: CTA */}
            <div className="space-y-6">
              <div className="card-glow rounded-2xl p-7 bg-card">
                <h3 className="text-xl font-bold font-display text-foreground mb-2">
                  Ready to Grow?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start building your faceless YouTube channel business right
                  now — no account, no credit card, no setup needed.
                </p>
                <Button
                  onClick={() => navigate({ to: "/dashboard" })}
                  data-ocid="landing.start_building.button"
                  className="rounded-full btn-primary-gradient border-0 hover:opacity-90 w-full"
                >
                  <Youtube className="mr-2 h-4 w-4" /> Start Building Now
                </Button>
              </div>
              <div id="pricing" className="card-glow rounded-2xl p-7 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display text-foreground">
                    Free Forever
                  </h3>
                  <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-semibold">
                    No Sign-Up
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pricingFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md btn-primary-gradient flex items-center justify-center">
                <span className="text-white font-bold text-xs font-display">
                  F
                </span>
              </div>
              <span className="text-sm font-semibold font-display text-foreground">
                FacelessCreator
              </span>
            </div>
            <div className="flex items-center gap-6">
              {["Features", "Dashboard", "Privacy"].map((link) => (
                <button
                  type="button"
                  key={link}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() =>
                    link === "Dashboard"
                      ? navigate({ to: "/dashboard" })
                      : undefined
                  }
                >
                  {link}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Built with ❤️ using caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
