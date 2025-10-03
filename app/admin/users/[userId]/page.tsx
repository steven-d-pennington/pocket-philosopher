"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Crown,
  ArrowLeft,
  CheckCircle,
  XCircle
} from "lucide-react";
import { UserProfileCard } from "@/components/admin/user-profile-card";
import { UserEntitlementsTab } from "@/components/admin/user-entitlements-tab";
import { UserActivityTab } from "@/components/admin/user-activity-tab";
import { AccountActionsPanel } from "@/components/admin/account-actions-panel";

interface UserProfile {
  user_id: string;
  email?: string;
  preferred_virtue: string | null;
  preferred_persona: string | null;
  experience_level: string | null;
  timezone: string;
  notifications_enabled: boolean;
  privacy_level: string;
  onboarding_complete: boolean;
  last_active_at: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface Purchase {
  id: string;
  product_id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  products: {
    id: string;
    name: string;
    description: string;
  };
}

interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  is_active: boolean;
  source: string;
  granted_at: string;
  expires_at: string | null;
  products: {
    id: string;
    name: string;
    description: string;
  };
}

interface UserStats {
  habitsCount: number;
  reflectionsCount: number;
}

interface UserDetailData {
  profile: UserProfile;
  purchases: Purchase[];
  entitlements: Entitlement[];
  stats: UserStats;
}

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setUserId(p.userId));
  }, [params]);

  const fetchUserDetail = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading user details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                {error || "User not found"}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const { profile, purchases, entitlements, stats } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        {/* User Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.email || `User ${profile.user_id.slice(0, 8)}...`}
                </h1>
                {profile.is_admin && (
                  <Badge variant="default" className="bg-yellow-500">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                {profile.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
                {profile.last_active_at && (
                  <div className="flex items-center gap-1">
                    Last active {new Date(profile.last_active_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Status Badge */}
          <div className="flex items-center gap-2">
            {profile.onboarding_complete ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Onboarding Incomplete
              </Badge>
            )}
          </div>
        </div>

        {/* Account Actions Panel */}
        <AccountActionsPanel
          userId={profile.user_id}
          onActionComplete={fetchUserDetail}
        />

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entitlements">
              Entitlements ({entitlements.length})
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <UserProfileCard
              profile={profile}
              stats={stats}
              onUpdate={fetchUserDetail}
            />
          </TabsContent>

          <TabsContent value="entitlements" className="space-y-4">
            <UserEntitlementsTab
              userId={profile.user_id}
              entitlements={entitlements}
              purchases={purchases}
              onUpdate={fetchUserDetail}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <UserActivityTab
              userId={profile.user_id}
              stats={stats}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
