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

    getTeamMembers: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ctx, input}) => {
        const { data, error } = await ctx.db.database.from('UserToProject')
            .select('*, User(*)')
            .eq('projectId', input.projectId);
            
        if (error) throw new Error(error.message);
        return data?.map(up => ({...up, user: up.User})) || [];
    })
})