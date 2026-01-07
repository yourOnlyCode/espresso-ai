'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Users, Workflow, TrendingUp, LogOut } from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-700">DocAuto</div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>
            <Link href="/documents" className="text-gray-700 hover:text-primary-600">
              Documents
            </Link>
            <Link href="/templates" className="text-gray-700 hover:text-primary-600">
              Templates
            </Link>
            <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600 flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your documents</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.documents?.total_documents || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Draft Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.documents?.draft_count || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Workflows</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.workflows?.active_workflows || 0}
                </p>
              </div>
              <Workflow className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Templates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.templates?.total_templates || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user_name}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/documents/new" className="block w-full btn-primary text-center">
                Create New Document
              </Link>
              <Link href="/templates" className="block w-full btn-secondary text-center">
                Browse Templates
              </Link>
              <Link href="/workflows" className="block w-full btn-secondary text-center">
                View Workflows
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
