'use client';

import Link from 'next/link';
import { FileText, Workflow, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary-700">DocAuto</div>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-primary-600">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Document Automation for Financial Services
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline compliance training, policy documentation, and regulatory reporting
            with AI-powered automation built for banking and finance.
          </p>
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Start Free Trial
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="card text-center">
            <FileText className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Templates</h3>
            <p className="text-gray-600">
              Pre-built templates for compliance, training, and policy documents
            </p>
          </div>

          <div className="card text-center">
            <Workflow className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Approval Workflows</h3>
            <p className="text-gray-600">
              Automated routing and approval chains with full audit trails
            </p>
          </div>

          <div className="card text-center">
            <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
            <p className="text-gray-600">
              Built-in SOX, FINRA, and regulatory compliance features
            </p>
          </div>

          <div className="card text-center">
            <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Intelligent document analysis and content generation
            </p>
          </div>
        </div>

        <div className="mt-20 card max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Trusted by Financial Institutions
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
              <div className="text-gray-600">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Audit Compliance</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Templates</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
