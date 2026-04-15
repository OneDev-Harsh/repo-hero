'use client'

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-between p-16 border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Repo Hero Logo" width={32} height={32} />
          <span className="text-base font-medium text-black tracking-tight">
            Repo-Hero
          </span>
        </div>

        {/* Content */}
        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-black">
            Understand any repository instantly.
          </h2>
          <p className="mt-5 text-gray-500 text-base leading-relaxed">
            Analyze codebases, explore structure, and get insights powered by AI - all in one place.
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} Repo-Hero
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-[#f8f8f8] px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl px-8 py-10">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Repo Hero Logo" width={22} height={22} />
                <span className="text-sm font-medium text-gray-700">
                  Repo-Hero
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-black tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Continue to your workspace
              </p>
            </div>

            {/* Clerk */}
            <div className="flex justify-center">
              <SignIn
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
                      'border border-gray-300 bg-white text-black hover:bg-gray-100 transition rounded-lg',
                    formButtonPrimary:
                      'bg-black text-white hover:bg-gray-900 active:scale-[0.985] transition rounded-lg',
                    formFieldInput:
                      'border border-gray-300 bg-white text-black placeholder-gray-400 focus:ring-0 focus:border-black transition rounded-md',
                    dividerLine: 'bg-gray-200',
                    footerActionText: 'text-gray-500',
                    footerActionLink: 'text-black hover:underline',
                  },
                }}
              />
            </div>
          </div>

          {/* Bottom Note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Secure authentication powered by Clerk
          </p>
        </motion.div>
      </div>
    </div>
  )
}
