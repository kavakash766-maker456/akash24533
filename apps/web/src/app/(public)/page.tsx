// src/app/(public)/page.tsx
// Public landing page — no auth required

'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, DollarSign, Shield, Zap, Star, Users } from 'lucide-react';

const features = [
  { icon: <Briefcase className="w-6 h-6"/>, title: 'Post Micro Jobs',     desc: 'Create jobs with custom budgets, deadlines, and proof requirements.' },
  { icon: <DollarSign className="w-6 h-6"/>, title: 'Earn Real Money',    desc: 'Complete tasks and withdraw earnings to PayPal, bank, or crypto.' },
  { icon: <Shield className="w-6 h-6"/>,     title: 'Secure Escrow',      desc: 'Funds are held safely in escrow — released only on approval.' },
  { icon: <Zap className="w-6 h-6"/>,        title: 'Instant Matching',   desc: 'Jobs are matched to workers globally in real-time.' },
  { icon: <Star className="w-6 h-6"/>,       title: 'Ratings System',     desc: 'Build your reputation with a verified review system.' },
  { icon: <Users className="w-6 h-6"/>,      title: 'Referral Bonuses',   desc: 'Invite friends and earn commission on their activity.' },
];

const stats = [
  { label: 'Active Workers', value: '50,000+' },
  { label: 'Jobs Completed', value: '2M+' },
  { label: 'Paid Out',       value: '$4.5M+' },
  { label: 'Countries',      value: '120+' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold text-blue-400">TaskEarn Pro</span>
          <div className="flex gap-4">
            <Link href="/login"    className="text-gray-300 hover:text-white px-4 py-2">Login</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block bg-blue-900/50 text-blue-300 text-sm px-4 py-1 rounded-full mb-6 border border-blue-800">
            🚀 The #1 Micro Job Marketplace
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent leading-tight">
            Earn Money.<br/>Post Jobs.<br/>Build Income.
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            TaskEarn Pro connects employers with a global workforce. Post micro tasks,
            complete them for cash, and withdraw instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register?role=worker"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition flex items-center gap-2">
              Start Earning <ArrowRight className="w-5 h-5"/>
            </Link>
            <Link href="/register?role=employer"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition">
              Post a Job
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl font-bold text-blue-400 mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-800 transition">
              <div className="text-blue-400 mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join 50,000+ workers and employers on TaskEarn Pro</p>
          <Link href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-5 h-5"/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between flex-wrap gap-4">
          <span>© 2024 TaskEarn Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/terms"   className="hover:text-gray-300">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/support" className="hover:text-gray-300">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
