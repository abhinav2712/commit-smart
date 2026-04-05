"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, GitCommit, Loader2, Sparkles } from "lucide-react";

import { generateCommitMessages } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast, Toaster } from "@/components/ui/toaster";

type TeamEnergy = "startup" | "enterprise" | "chaos";
type CommitVibes = {
  conventional: string;
  descriptive: string;
  funny: string;
};

const PLACEHOLDER_DIFF = `diff --git a/app/page.tsx b/app/page.tsx
index 8f3c1d2..e9f7b81 100644
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -1,6 +1,18 @@
-export default function Home() {
-  return <main>Hello</main>
-}
+export default function Home() {
+  return (
+    <main className="min-h-screen">
+      <h1>Git-Good AI</h1>
+    </main>
+  )
+}`;

export function GitGoodApp() {
  const [diff, setDiff] = useState(PLACEHOLDER_DIFF);
  const [energy, setEnergy] = useState<TeamEnergy>("startup");
  const [result, setResult] = useState<CommitVibes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof CommitVibes>("conventional");
  const [isPending, setIsPending] = useState(false);

  const handleGenerate = async () => {
    setError(null);
    setIsPending(true);

    try {
      const payload = await generateCommitMessages(diff, energy);
      setResult(payload);
      setActiveTab("conventional");

      toast({
        title: "Vibes generated",
        description: "Your commit messages are ready to copy.",
      });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong while reading the diff.");
    } finally {
      setIsPending(false);
    }
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Commit message is ready to paste.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as keyof CommitVibes);
  };

  const currentMessage = result ? result[activeTab] : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#020617_100%)] text-slate-100">
      <Toaster />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10">
                <GitCommit className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-200/70">
                  Git-Good AI
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Turn diffs into commit messages that sound intentional.
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Paste a git diff, pick the team energy, and generate conventional,
              descriptive, and slightly unhinged commit vibes in one click.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-white/10 bg-slate-950/40">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Sparkles className="h-4 w-4 text-sky-300" />
                  Commit diff
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Team energy
                  </span>
                  <ToggleGroup
                    value={energy}
                    onValueChange={(value) => setEnergy((value || "startup") as TeamEnergy)}
                    type="single"
                    className="rounded-full border border-white/10 bg-white/5 p-1"
                  >
                    <ToggleGroupItem value="startup">Startup</ToggleGroupItem>
                    <ToggleGroupItem value="enterprise">Enterprise</ToggleGroupItem>
                    <ToggleGroupItem value="chaos">Chaos</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={diff}
                  onChange={(event) => setDiff(event.target.value)}
                  placeholder="Paste the git diff here..."
                  className="min-h-[320px] resize-y border-white/10 bg-slate-950/80 font-mono text-sm leading-6 text-slate-100 placeholder:text-slate-500"
                />

                {error ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}

                <Button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="w-full justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-6 text-sm font-semibold text-slate-950 hover:bg-sky-300"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Vibes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base text-white">Output</CardTitle>
                <p className="text-sm text-slate-400">
                  Switch tabs to inspect the tone you want, then copy the line you
                  need.
                </p>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="conventional">Conventional</TabsTrigger>
                          <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
                          <TabsTrigger value="funny">Funny</TabsTrigger>
                        </TabsList>

                        <TabsContent value="conventional">
                          <MessageCard
                            label="Angular style"
                            value={result.conventional}
                            onCopy={() => copyMessage(result.conventional)}
                          />
                        </TabsContent>
                        <TabsContent value="descriptive">
                          <MessageCard
                            label="Detailed summary"
                            value={result.descriptive}
                            onCopy={() => copyMessage(result.descriptive)}
                          />
                        </TabsContent>
                        <TabsContent value="funny">
                          <MessageCard
                            label="Witty take"
                            value={result.funny}
                            onCopy={() => copyMessage(result.funny)}
                          />
                        </TabsContent>
                      </Tabs>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400"
                    >
                      <GitCommit className="mb-3 h-5 w-5 text-sky-300" />
                      No vibe output yet. Paste a diff and hit Generate Vibes.
                    </motion.div>
                  )}
                </AnimatePresence>

                {currentMessage ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Current selection
                    </p>
                    <p className="font-mono text-sm leading-6 text-slate-100">
                      {currentMessage}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function MessageCard({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <Card className="mt-4 border-white/10 bg-slate-950/50">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">{label}</p>
            <p className="mt-1 text-sm text-slate-400">
              Copy-ready and safe to paste into your terminal or commit tool.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-sm leading-6 text-slate-100">{value}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          Ready to commit.
        </div>
      </CardContent>
    </Card>
  );
}
