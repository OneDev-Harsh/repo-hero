import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";
import cuid from "cuid";
import { after } from "next/server";

export type Project = {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    githubUrl: string;
    deletedAt: string | null;
    status: string;
    progress: number;
    errorDetails: string | null;
}

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional(),
        })
    ).mutation(async ({ctx, input}) => {
        const projectId = cuid();
        const { data: project, error: projectError } = await ctx.db.database.from('Project').insert({
            id: projectId,
            name: input.name,
            githubUrl: input.githubUrl,
            status: 'PENDING',
            progress: 0,
            updatedAt: new Date().toISOString()
        }).select().single();
        
        if (projectError) throw new Error(projectError.message);

        const { error: relationError } = await ctx.db.database.from('UserToProject').insert({
            id: cuid(),
            userId: ctx.user.userId!,
            projectId: projectId,
            updatedAt: new Date().toISOString()
        });
        
        if (relationError) throw new Error(relationError.message);

        after(async () => {
            try {
                await ctx.db.database.from('Project').update({ status: 'CLONING_REPO', progress: 5 }).eq('id', projectId);
                await indexGithubRepo(projectId, input.githubUrl, process.env.GITHUB_TOKEN);
                
                await ctx.db.database.from('Project').update({ status: 'PROCESSING_COMMITS', progress: 80 }).eq('id', projectId);
                await pollCommits(projectId);
                
                await ctx.db.database.from('Project').update({ status: 'COMPLETED', progress: 100 }).eq('id', projectId);
            } catch (error: any) {
                console.error("Background ingestion failed", error);
                await ctx.db.database.from('Project').update({ status: 'FAILED', errorDetails: error?.message || 'Unknown error' }).eq('id', projectId);
            }
        });

        return project as Project;
    }),

    getProjects: protectedProcedure.query(async ({ctx}) => {
        const { data, error } = await ctx.db.database
            .from('UserToProject')
            .select('Project(*)')
            .eq('userId', ctx.user.userId!);
            
        if (error) throw new Error(error.message);
        
        return (data?.map(d => d.Project).filter(p => p && p.deletedAt === null) as Project[]) || [];
    }),

    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ctx, input}) => {
        const { data, error } = await ctx.db.database.from('Commit').select('*').eq('projectId', input.projectId);
        if (error) throw new Error(error.message);
        return data || [];
    }),

    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any()
    })).mutation(async ({ctx, input}) => {
        const { data, error } = await ctx.db.database.from('Question').insert({
            id: cuid(),
            answer: input.answer,
            filesReferences: input.filesReferences,
            projectId: input.projectId,
            question: input.question,
            userId: ctx.user.userId!,
            updatedAt: new Date().toISOString()
        }).select().single();
        
        if (error) throw new Error(error.message);
        return data;
    }),

    getQuestions: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ctx, input}) => {
        const { data, error } = await ctx.db.database.from('Question')
            .select('*, User(*)')
            .eq('projectId', input.projectId)
            .order('createdAt', { ascending: false });
            
        if (error) throw new Error(error.message);
        return data?.map(q => ({...q, user: q.User})) || [];
    }),

    archiveProject: protectedProcedure.input(z.object({projectId: z.string()})).mutation(async ({ctx, input}) => {
        const { data, error } = await ctx.db.database.from('Project').update({
            deletedAt: new Date().toISOString()
        }).eq('id', input.projectId).select().single();
        
        if (error) throw new Error(error.message);
        return data;
    }),

    syncProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ctx, input}) => {
        // Verify membership
        const { data: membership } = await ctx.db.database.from('UserToProject')
            .select('id')
            .eq('userId', ctx.user.userId!)
            .eq('projectId', input.projectId)
            .single();

        if (!membership) throw new Error('Unauthorized');

        // Mark as syncing (non-blocking background work)
        await ctx.db.database.from('Project')
            .update({ status: 'SYNCING', updatedAt: new Date().toISOString() })
            .eq('id', input.projectId);

        after(async () => {
            try {
                // pollCommits internally calls filterUnprocessedCommits — only new commits are processed
                await pollCommits(input.projectId);
                await ctx.db.database.from('Project')
                    .update({ status: 'COMPLETED', updatedAt: new Date().toISOString() })
                    .eq('id', input.projectId);
            } catch (err: any) {
                console.error('Sync failed', err);
                await ctx.db.database.from('Project')
                    .update({ status: 'COMPLETED', errorDetails: err?.message })
                    .eq('id', input.projectId);
            }
        });

        return { queued: true };
    }),

    renameProject: protectedProcedure.input(z.object({
        projectId: z.string(),
        name: z.string().min(1).max(100),
    })).mutation(async ({ctx, input}) => {
        // Verify the caller is a member of this project
        const { data: membership } = await ctx.db.database.from('UserToProject')
            .select('id')
            .eq('userId', ctx.user.userId!)
            .eq('projectId', input.projectId)
            .single();

        if (!membership) throw new Error('Unauthorized');

        const { data, error } = await ctx.db.database.from('Project').update({
            name: input.name,
            updatedAt: new Date().toISOString(),
        }).eq('id', input.projectId).select().single();

        if (error) throw new Error(error.message);
        return data;
    }),

    removeMember: protectedProcedure.input(z.object({
        projectId: z.string(),
        memberUserId: z.string(),
    })).mutation(async ({ctx, input}) => {
        // Verify the caller is a member of this project
        const { data: membership } = await ctx.db.database.from('UserToProject')
            .select('id')
            .eq('userId', ctx.user.userId!)
            .eq('projectId', input.projectId)
            .single();

        if (!membership) throw new Error('Unauthorized');

        const { error } = await ctx.db.database.from('UserToProject')
            .delete()
            .eq('userId', input.memberUserId)
            .eq('projectId', input.projectId);

        if (error) throw new Error(error.message);
        return { success: true };
    }),

    getTeamMembers: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ctx, input}) => {
        const { data, error } = await ctx.db.database.from('UserToProject')
            .select('*, User(*)')
            .eq('projectId', input.projectId);
            
        if (error) throw new Error(error.message);
        return data?.map(up => ({...up, user: up.User})) || [];
    }),

    getGlobalStats: protectedProcedure.query(async ({ctx}) => {
        // Fetch all projects for this user
        const { data: userProjects, error: userError } = await ctx.db.database
            .from('UserToProject')
            .select('projectId')
            .eq('userId', ctx.user.userId!);
            
        if (userError) throw new Error(userError.message);
        const projectIds = userProjects?.map(up => up.projectId) || [];
        
        if (projectIds.length === 0) {
            return { totalProjects: 0, totalCommits: 0, totalFiles: 0 };
        }

        // Count projects
        const { count: totalProjects } = await ctx.db.database.from('Project')
            .select('*', { count: 'exact', head: true })
            .in('id', projectIds)
            .is('deletedAt', null);

        // Count commits
        const { count: totalCommits } = await ctx.db.database.from('Commit')
            .select('*', { count: 'exact', head: true })
            .in('projectId', projectIds);

        // Count embeddings (files)
        const { count: totalFiles } = await ctx.db.database.from('SourceCodeEmbedding')
            .select('*', { count: 'exact', head: true })
            .in('projectId', projectIds);

        return {
            totalProjects: totalProjects || 0,
            totalCommits: totalCommits || 0,
            totalFiles: totalFiles || 0
        };
    }),

    getRecentActivity: protectedProcedure.query(async ({ctx}) => {
        // Fetch user projects
        const { data: userProjects, error: userError } = await ctx.db.database
            .from('UserToProject')
            .select('projectId')
            .eq('userId', ctx.user.userId!);
            
        if (userError) throw new Error(userError.message);
        const projectIds = userProjects?.map(up => up.projectId) || [];
        
        if (projectIds.length === 0) return [];

        // Fetch recent commits
        const { data: recentCommits } = await ctx.db.database.from('Commit')
            .select('*, Project(name)')
            .in('projectId', projectIds)
            .order('createdAt', { ascending: false })
            .limit(10);

        // Fetch recent questions
        const { data: recentQuestions } = await ctx.db.database.from('Question')
            .select('*, Project(name)')
            .in('projectId', projectIds)
            .order('createdAt', { ascending: false })
            .limit(10);

        // Combine and sort
        const activities = [
            ...(recentCommits?.map(c => ({ ...c, type: 'commit' as const, date: new Date(c.createdAt).getTime() })) || []),
            ...(recentQuestions?.map(q => ({ ...q, type: 'question' as const, date: new Date(q.createdAt).getTime() })) || [])
        ].sort((a, b) => b.date - a.date).slice(0, 10);

        return activities;
    })
})