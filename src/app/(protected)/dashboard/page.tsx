'use client';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderGit2,
  Database,
  GitCommit,
  Activity,
  Plus,
  Terminal,
  Search,
  ArrowRight,
  GitBranch,
  Clock,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import EditProjectDialog from "~/app/(protected)/dashboard/edit-project-dialog";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function GlobalDashboardPage() {
  const { user } = useUser();
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);

  const utils = api.useUtils();

  const { data: stats, isLoading: isStatsLoading } = api.project.getGlobalStats.useQuery();
  const { data: projects, isLoading: isProjectsLoading } = api.project.getProjects.useQuery(
    undefined,
    { refetchInterval: syncingIds.size > 0 ? 3000 : false }
  );
  const { data: activity, isLoading: isActivityLoading } = api.project.getRecentActivity.useQuery();

  const isLoading = isStatsLoading || isProjectsLoading || isActivityLoading;

  const syncProject = api.project.syncProject.useMutation({
    onMutate: ({ projectId }) => {
      setSyncingIds(prev => new Set(prev).add(projectId));
    },
    onSuccess: (_, { projectId }) => {
      toast.success('Sync started — new commits will appear shortly.');
      // Poll until the project flips back to COMPLETED
      const interval = setInterval(async () => {
        await utils.project.getProjects.invalidate();
        const fresh = projects?.find(p => p.id === projectId);
        if (fresh?.status === 'COMPLETED') {
          clearInterval(interval);
          setSyncingIds(prev => { const s = new Set(prev); s.delete(projectId); return s; });
          await utils.project.getRecentActivity.invalidate();
          toast.success('Sync complete!');
        }
      }, 3000);
      // Safety timeout after 3 min
      setTimeout(() => {
        clearInterval(interval);
        setSyncingIds(prev => { const s = new Set(prev); s.delete(projectId); return s; });
      }, 180_000);
    },
    onError: (err, { projectId }) => {
      setSyncingIds(prev => { const s = new Set(prev); s.delete(projectId); return s; });
      toast.error(`Sync failed: ${err.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <>
    <div className="min-h-screen px-6 py-8 sm:px-10 sm:py-10 max-w-7xl mx-auto space-y-10">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <motion.section
        custom={0} variants={fade} initial="hidden" animate="show"
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground font-medium">{greeting}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {user?.firstName ?? 'Developer'}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            {stats?.totalProjects
              ? `You have ${stats.totalProjects} ${stats.totalProjects === 1 ? 'repository' : 'repositories'} indexed across your workspace.`
              : 'Import a repository to start analyzing your codebase.'}
          </p>
        </div>

        <Link href="/create">
          <Button className="gap-2 shrink-0 group" size="default">
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            Import Repository
          </Button>
        </Link>
      </motion.section>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <motion.section
        custom={1} variants={fade} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Repositories",
            value: stats?.totalProjects ?? 0,
            icon: FolderGit2,
          },
          {
            label: "Commits Indexed",
            value: (stats?.totalCommits ?? 0).toLocaleString(),
            icon: GitCommit,
          },
          {
            label: "Embeddings",
            value: (stats?.totalFiles ?? 0).toLocaleString(),
            icon: Database,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="p-6 flex items-start gap-4 border-border/60 bg-card hover:bg-muted/30 transition-colors duration-200"
          >
            <div className="mt-0.5 p-2 rounded-md border border-border/60 bg-muted/40">
              <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            </div>
          </Card>
        ))}
      </motion.section>

      {/* ── MAIN GRID ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── PROJECTS ──────────────────────────────────────────── */}
        <motion.section
          custom={2} variants={fade} initial="hidden" animate="show"
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-foreground">Repositories</h2>
            </div>
            <Link
              href="/create"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.slice(0, 4).map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <Card className="group relative p-5 border-border/60 bg-card hover:bg-muted/30 hover:border-border transition-all duration-200 cursor-pointer">
                    {/* Actions — sync + edit + arrow */}
                    <div className="absolute top-3 right-3 flex items-center gap-0.5">
                      {/* Sync button */}
                      <button
                        aria-label="Sync project"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!syncingIds.has(project.id) && project.status === 'COMPLETED') {
                            syncProject.mutate({ projectId: project.id });
                          }
                        }}
                        disabled={syncingIds.has(project.id) || project.status !== 'COMPLETED'}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            syncingIds.has(project.id) ? 'animate-spin' : ''
                          }`}
                        />
                      </button>
                      {/* Edit button */}
                      <button
                        aria-label="Edit project"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingProject({ id: project.id, name: project.name });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-3 pr-20">
                      {/* Icon + name */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center shrink-0">
                          <FolderGit2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate group-hover:text-foreground transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Status pill */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            project.status === 'COMPLETED' && !syncingIds.has(project.id)
                              ? 'bg-foreground/50'
                              : 'bg-foreground/30 animate-pulse'
                          }`}
                        />
                        {syncingIds.has(project.id)
                          ? 'Syncing…'
                          : project.status === 'COMPLETED'
                          ? 'Synced'
                          : 'Indexing…'}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-14 border-dashed border-border/60 bg-transparent text-center">
              <div className="w-10 h-10 rounded-md border border-border/60 bg-muted/30 flex items-center justify-center mb-4">
                <FolderGit2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">No repositories yet</h3>
              <p className="text-xs text-muted-foreground mb-5 max-w-xs leading-relaxed">
                Import a GitHub repository to begin indexing commits and running semantic search over your codebase.
              </p>
              <Link href="/create">
                <Button variant="outline" size="sm">Import Repository</Button>
              </Link>
            </Card>
          )}
        </motion.section>

        {/* ── ACTIVITY ──────────────────────────────────────────── */}
        <motion.section
          custom={3} variants={fade} initial="hidden" animate="show"
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground">Activity</h2>
          </div>

          <Card className="overflow-hidden border-border/60 bg-card">
            <div className="divide-y divide-border/50 max-h-[420px] overflow-y-auto">
              {activity && activity.length > 0 ? (
                activity.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors duration-150"
                  >
                    {/* Icon */}
                    <div className="mt-0.5 p-1.5 rounded-md border border-border/50 bg-muted/30 shrink-0">
                      {item.type === 'commit' ? (
                        <GitCommit className="w-3 h-3 text-muted-foreground" strokeWidth={1.75} />
                      ) : (
                        <Search className="w-3 h-3 text-muted-foreground" strokeWidth={1.75} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">
                        {item.type === 'commit' ? (
                          <>Commit indexed in <span className="font-medium">{item.Project?.name}</span></>
                        ) : (
                          <>Query in <span className="font-medium">{item.Project?.name}</span></>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate leading-snug">
                        {item.type === 'commit' ? item.commitMessage : item.question}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wide font-medium">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                  <div className="p-2 rounded-md border border-border/50 bg-muted/30">
                    <Terminal className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </motion.section>
      </div>
    </div>

      {/* Edit Project Dialog */}
      {editingProject && (
        <EditProjectDialog
          projectId={editingProject.id}
          currentName={editingProject.name}
          open={!!editingProject}
          onOpenChange={(o) => { if (!o) setEditingProject(null); }}
        />
      )}
    </>
  );
}