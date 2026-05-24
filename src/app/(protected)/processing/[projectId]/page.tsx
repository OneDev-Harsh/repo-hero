'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@insforge/sdk'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CheckCircle2, CircleDashed, Loader2, XCircle, Terminal } from 'lucide-react'

// Steps in the pipeline
const PIPELINE_STEPS = [
  { id: 'PENDING', label: 'Initializing Pipeline' },
  { id: 'CLONING_REPO', label: 'Connecting to GitHub' },
  { id: 'PARSING_FILES', label: 'Parsing Codebase Structure' },
  { id: 'GENERATING_SUMMARIES', label: 'Generating AI Summaries' },
  { id: 'INDEXING_VECTORS', label: 'Indexing Vector Database' },
  { id: 'PROCESSING_COMMITS', label: 'Analyzing Git History' },
  { id: 'COMPLETED', label: 'Project Ready' }
];

export default function ProcessingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>('');
  
  const [status, setStatus] = useState('PENDING')
  const [progress, setProgress] = useState(0)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    params.then(p => setProjectId(p.projectId));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;

    // Initialize InsForge Realtime Client
    const insforge = createClient({
      baseUrl: 'https://ejfmzxt7.ap-southeast.insforge.app',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjAwMDJ9.1GxkQ2wmBwbuV9GG0JRowzK0uLzHK6tG6wnboKjggRw'
    });

    const setupRealtime = async () => {
      await insforge.realtime.connect();
      const { ok, error } = await insforge.realtime.subscribe(`project:${projectId}`);
      
      if (!ok) {
        console.error('Failed to subscribe:', error);
        return;
      }

      setLogs(prev => [...prev, '> Connected to processing engine...']);
      setLogs(prev => [...prev, `> Subscribed to project ${projectId}`]);

      // Handle Live Database Updates
      insforge.realtime.on('status_update', (payload: any) => {
        if (payload.status) {
          setStatus(payload.status);
          setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1]?.split('.')[0]}] SYSTEM_UPDATE: ${payload.status}`]);
        }
        if (payload.progress !== undefined) setProgress(payload.progress);
        if (payload.errorDetails) setErrorDetails(payload.errorDetails);

        if (payload.status === 'COMPLETED') {
          setTimeout(() => {
            router.push(`/dashboard`);
          }, 2000); // Wait 2s on success before navigating
        }
      });
    };

    setupRealtime();

    return () => {
      insforge.realtime.unsubscribe(`project:${projectId}`);
      insforge.realtime.disconnect();
    };
  }, [projectId, router]);

  const getCurrentStepIndex = () => {
    if (status === 'FAILED') return PIPELINE_STEPS.length;
    const index = PIPELINE_STEPS.findIndex(s => s.id === status);
    return index === -1 ? PIPELINE_STEPS.length - 1 : index;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10"
      >
        
        {/* Left Side: Pipeline Steps */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
              Building Project
            </h1>
            <p className="text-muted-foreground text-sm">
              Our AI agents are analyzing your repository. Please don't close this window.
            </p>
          </div>

          <div className="space-y-6 relative">
            {/* Connecting line */}
            <div className="absolute left-3 top-4 bottom-4 w-px bg-border" />

            {PIPELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex || status === 'COMPLETED';
              const isActive = index === currentStepIndex && status !== 'FAILED';
              const isPending = index > currentStepIndex && status !== 'FAILED';

              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 relative z-10 ${
                    isActive ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center bg-background border
                    ${isActive ? 'text-primary border-primary' : isCompleted ? 'text-emerald-500 border-emerald-500' : 'text-muted-foreground/40 border-border'}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : 
                     isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     <CircleDashed className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1">
                    <span className="font-medium text-sm">{step.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="h-0.5 mt-1 bg-primary rounded-full"
                        style={{ width: '100%' }}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}

            {status === 'FAILED' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-4 text-destructive relative z-10"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-background border border-destructive">
                  <XCircle className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">Pipeline Failed</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Side: Terminal / Progress Stats */}
        <div className="flex flex-col gap-6">
          
          {/* Main Progress Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-1">Total Progress</div>
                <div className="text-4xl font-light tracking-tighter tabular-nums text-foreground">{progress}%</div>
              </div>
              {status === 'FAILED' ? (
                <div className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20">Error</div>
              ) : status === 'COMPLETED' ? (
                <div className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Done</div>
              ) : (
                <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 animate-pulse">Running</div>
              )}
            </div>
            
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 1 }}
              />
            </div>
          </div>

          {/* Terminal Window */}
          <div className="flex-1 bg-card border border-border/60 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[300px]">
            <div className="bg-muted/30 px-4 py-3 border-b border-border/60 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">system.log</span>
            </div>
            <div className="p-4 font-mono text-[11px] leading-relaxed text-muted-foreground overflow-y-auto flex-1 flex flex-col justify-end space-y-1">
              <AnimatePresence>
                {logs.slice(-12).map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="break-all"
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              {status !== 'COMPLETED' && status !== 'FAILED' && (
                <motion.div 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-2 h-3 bg-muted-foreground mt-2"
                />
              )}
            </div>
          </div>

          {status === 'FAILED' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <h3 className="text-destructive text-sm font-semibold mb-1">Processing Error</h3>
              <p className="text-destructive/80 text-xs">{errorDetails || 'An unknown error occurred during ingestion.'}</p>
              <button 
                onClick={() => router.push('/create')}
                className="mt-3 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive text-xs rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  )
}
