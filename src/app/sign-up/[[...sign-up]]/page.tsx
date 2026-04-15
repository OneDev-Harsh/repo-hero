'use client'

import { SignUp } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-white overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-between p-16 border-r border-gray-200">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Repo Hero Logo" width={32} height={32} />
          <span className="text-base font-medium tracking-tight text-black">
            Repo-Hero
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-black">
            Start exploring repositories smarter.
          </h2>
          <p className="mt-5 text-gray-500 text-base leading-relaxed">
            Analyze codebases, understand structure, and get instant insights - all in one place.
          </p>
        </div>

        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} Repo-Hero
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-[#f7f7f7] px-6 py-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl px-8 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.png" alt="Repo Hero Logo" width={20} height={20} />
                <span className="text-sm font-medium text-gray-700">
                  Repo-Hero
                </span>
              </div>

              <h2 className="text-xl font-semibold text-black tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Get started in seconds
              </p>
            </div>

            {/* Clerk */}
            <div className="flex justify-center">
              <SignUp
                appearance={{
                  layout: {
                    socialButtonsPlacement: 'top',
                  },
                  elements: {
                    rootBox: 'w-full flex justify-center',
                    card: 'bg-transparent shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton:
                      'border border-gray-300 bg-white text-black hover:bg-gray-100 transition rounded-lg h-10',
                    formButtonPrimary:
                      'bg-black text-white hover:bg-gray-900 active:scale-[0.985] transition rounded-lg h-10',
                    formFieldInput:
                      'border border-gray-300 bg-white text-black placeholder-gray-400 focus:ring-0 focus:border-black transition rounded-md h-10',
                    dividerLine: 'bg-gray-200',
                    footerActionText: 'text-gray-500',
                    footerActionLink: 'text-black hover:underline',
                  },
                }}
              />
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure authentication powered by Clerk
          </p>
        </motion.div>
      </div>
    </div>
  )
}
