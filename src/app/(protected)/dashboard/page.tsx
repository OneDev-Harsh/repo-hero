'use client'

import { useUser } from "@clerk/nextjs";
import useProject from "~/hooks/use-project";
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";

const DashboardPage = () => {
  const { project } = useProject();

  return (
    <div className="px-6 py-6 space-y-6 w-full">

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
          <span>Team Members</span>
          <span>Invite</span>
          <span>Archive</span>
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

export default DashboardPage;