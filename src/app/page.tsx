'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">

      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={28} height={28} />
          <span className="font-medium tracking-tight">Repo-Hero</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/sign-in" className="text-gray-600 hover:text-black transition">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900 transition"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-8 py-32 text-center max-w-5xl mx-auto">
        <div className="absolute inset-0 -z-10 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />

        <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]">
          Understand any GitHub repository instantly.
        </h1>

        <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Break down complex codebases, explore architecture, and get instant AI insights — without wasting hours reading code.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/sign-up"
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 active:scale-[0.98] transition"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-100 transition"
          >
            Sign in
          </Link>
        </div>

        {/* MAIN PREVIEW */}
        <div className="mt-20 mx-auto max-w-4xl border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[#fafafa] px-4 py-2 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full" />
            repo-hero.ai/analyze
          </div>

          <div className="grid md:grid-cols-2 text-left">
            <div className="p-6 border-r border-gray-200 text-sm font-mono text-gray-800 leading-relaxed">
              <p className="text-gray-400">// repo structure</p>
              <p>src/</p>
              <p> ├── components/</p>
              <p> ├── api/</p>
              <p> └── utils/</p>
              <p className="mt-4 text-gray-400">// function</p>
              <p>function analyzeRepo() {'{'}</p>
              <p className="pl-4">return insights</p>
              <p>{'}'}</p>
            </div>

            <div className="p-6 text-sm text-gray-700 leading-relaxed">
              <p className="font-medium mb-2">AI Summary</p>
              <p>
                This repository is structured around modular components and API utilities. The main logic focuses on efficient analysis and insight extraction.
              </p>
              <div className="mt-4 text-xs text-gray-400">
                Generated instantly by Repo-Hero
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECOND BLOCK */}
      <section className="px-8 py-28 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Chat UI */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-[#fafafa] px-4 py-2 border-b text-xs text-gray-500">
              Ask Repo-Hero
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="text-right">
                <span className="inline-block bg-black text-white px-3 py-2 rounded-lg">
                  What does this repo do?
                </span>
              </div>

              <div className="text-left">
                <span className="inline-block border border-gray-200 px-3 py-2 rounded-lg text-gray-700">
                  It analyzes GitHub repositories and generates summaries, insights, and structure.
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Ask questions. Get answers.
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Instead of digging through code, just ask. Repo-Hero gives you clear, contextual answers instantly.
            </p>
          </div>
        </div>
      </section>

      {/* THIRD BLOCK */}
      <section className="px-8 py-28 border-t border-gray-200 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              See structure at a glance.
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Visualize how everything connects so you can onboard faster and understand deeper.
            </p>
          </div>

          {/* Structure UI */}
          <div className="border border-gray-200 rounded-2xl p-6 text-sm font-mono text-gray-800">
            <p>repo/</p>
            <p> ├── frontend/</p>
            <p> │   ├── pages/</p>
            <p> │   └── components/</p>
            <p> ├── backend/</p>
            <p> │   ├── api/</p>
            <p> │   └── services/</p>
            <p> └── database/</p>
          </div>

        </div>
      </section>

    </div>
  )
}
