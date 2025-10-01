"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Book,
  Settings,
  BarChart3,
  ArrowRight
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  // Redirect to dashboard after a brief loading period
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/admin/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  const adminSections = [
    {
      title: "Dashboard",
      description: "Overview of platform metrics and recent activity",
      icon: BarChart3,
      href: "/admin/dashboard",
      color: "text-blue-600"
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-green-600"
    },
    {
      title: "Purchases",
      description: "View transactions and revenue analytics",
      icon: CreditCard,
      href: "/admin/purchases",
      color: "text-purple-600"
    },
    {
      title: "Content",
      description: "Manage philosophy content and analytics",
      icon: Book,
      href: "/admin/content",
      color: "text-orange-600"
    },
    {
      title: "Analytics",
      description: "Detailed platform analytics and insights",
      icon: TrendingUp,
      href: "/admin/analytics",
      color: "text-red-600"
    },
    {
      title: "Settings",
      description: "Configure system settings and features",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to your platform administration center
          </p>
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(section.href)}
                >
                  Access {section.title}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-gray-500">
          <p>This page will automatically redirect to the dashboard in a few seconds.</p>
          <p className="mt-2">Click any card above to navigate directly to that section.</p>
        </div>
      </div>
    </AdminLayout>
  );
}