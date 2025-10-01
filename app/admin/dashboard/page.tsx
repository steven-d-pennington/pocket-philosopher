"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";

interface DashboardData {
  metrics: {
    totalUsers: number;
    totalPurchases: number;
    totalRevenue: number;
  };
  recentActivity: {
    purchases: Array<{
      id: string;
      products?: { name: string };
      created_at: string;
      amount_cents: number;
    }>;
    users: Array<{
      user_id: string;
      preferred_persona?: string;
      created_at: string;
      experience_level?: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your Pocket Philosopher platform
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalPurchases || 0}</div>
              <p className="text-xs text-muted-foreground">
                Completed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data?.metrics.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">
                From last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentActivity.purchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {purchase.products?.name || "Unknown Product"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(purchase.amount_cents / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
                {(!data?.recentActivity.purchases || data.recentActivity.purchases.length === 0) && (
                  <p className="text-sm text-gray-500">No recent purchases</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentActivity.users.slice(0, 5).map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {user.preferred_persona || "New User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.experience_level || "Beginner"}
                    </div>
                  </div>
                ))}
                {(!data?.recentActivity.users || data.recentActivity.users.length === 0) && (
                  <p className="text-sm text-gray-500">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}