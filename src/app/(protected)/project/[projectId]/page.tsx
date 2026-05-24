'use client'

import { useEffect } from "react";
import { useParams } from "next/navigation";
import useProject from "~/hooks/use-project";
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import CommitLog from "~/app/(protected)/dashboard/commit-log";
import AskQuestionCard from "~/app/(protected)/dashboard/ask-question-card";
import ArchiveButton from "~/app/(protected)/dashboard/archive-button";
import InviteButton from "~/app/(protected)/dashboard/invite-button";
import TeamMembers from "~/app/(protected)/dashboard/team-members";
import { Button } from "~/components/ui/button";

const ProjectDetailPage = () => {
  const params = useParams();
  const { project, setProjectId } = useProject();

  useEffect(() => {
    if (params.projectId && typeof params.projectId === 'string') {
      setProjectId(params.projectId);
    }
  }, [params.projectId, setProjectId]);

  return (
    <div className="px-6 py-6 space-y-6 w-full">
      {/* HEADER & NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Button>
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {project?.name || "Loading Project..."}
        </h1>
      </div>

      {/* TOP SECTION */}
      <div className="space-y-4">
        {/* GITHUB CONNECTION */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-muted/30">
          <SiGithub className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            This project is connected to{" "}
            <Link
              href={project?.githubUrl ?? ""}
              className="text-primary hover:underline inline-flex items-center gap-1"
              target="_blank"
            >
              {project?.githubUrl}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>

        {/* TEAM / ACTIONS */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>

      {/* ASK QUESTION (FULL WIDTH) */}
      <div className="w-full">
        <AskQuestionCard />
      </div>

      {/* COMMIT LOG */}
      <div className="w-full">
        <CommitLog />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
