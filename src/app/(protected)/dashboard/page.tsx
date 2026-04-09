'use client'

import { useUser } from "@clerk/nextjs";
import useProject from "~/hooks/use-project";
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import CommitLog from "./commit-log";

const DashboardPage = () => {

  const {project} = useProject();

  return (
    <div>
      <div className="">
        {project?.id}
        {/**Github link */}
        <div className="">
          <SiGithub className="" />
          <div className="">
            <p className="">
              This project is connected to {' '}
              <Link href={project?.githubUrl ?? ""} className="">{project?.githubUrl}</Link>
              <ExternalLink className="" />
            </p>
          </div>
        </div>

        <div className="">
          TeamMembers
          InviteButton
          ArchiveButton
        </div>

      </div>

      <div className="">
        <div className="">
          AskQuestionCard
          MeetingCard
        </div>
      </div>

      <div className=""></div>
      <CommitLog />

    </div>
  )
}

export default DashboardPage