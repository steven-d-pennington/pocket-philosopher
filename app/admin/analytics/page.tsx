"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Book,
  Target,
  Calendar,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalPurchases: number;
    totalRevenue: number;
    totalConversations: number;
    totalHabits: number;
    totalReflections: number;
  };
  trends: {
    usersThisWeek: number;
    purchasesThisWeek: number;
    revenueThisWeek: number;
  };
  topContent: Array<{
    work: string;
    author: string;
    usage_count: number;
  }>;
  userActivity: Array<{
    date: string;
    users: number;
    conversations: number;
    purchases: number;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Platform metrics and insights
            </p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{data?.trends.usersThisWeek || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data?.metrics.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{formatCurrency(data?.trends.revenueThisWeek || 0)} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalConversations || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total AI interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalHabits || 0}</div>
              <p className="text-xs text-muted-foreground">
                User practice tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalPurchases || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{data?.trends.purchasesThisWeek || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reflections</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.metrics.totalReflections || 0}</div>
              <p className="text-xs text-muted-foreground">
                Journal entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(data?.metrics.totalPurchases || 0, data?.metrics.totalUsers || 1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Purchase conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topContent?.slice(0, 5).map((content, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {content.work}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {content.author}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {content.usage_count} uses
                  </Badge>
                </div>
              )) || (
                <p className="text-gray-500">No content usage data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.userActivity?.slice(0, 7).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{activity.users}</div>
                      <div className="text-gray-500">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{activity.conversations}</div>
                      <div className="text-gray-500">Chats</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{activity.purchases}</div>
                      <div className="text-gray-500">Purchases</div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No activity data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}