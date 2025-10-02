"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  user_id: string;
  preferred_virtue: string | null;
  preferred_persona: string | null;
  experience_level: string | null;
  timezone: string;
  notifications_enabled: boolean;
  privacy_level: string;
  onboarding_complete: boolean;
  is_admin: boolean;
}

interface UserStats {
  habitsCount: number;
  reflectionsCount: number;
}

interface Props {
  profile: UserProfile;
  stats: UserStats;
  onUpdate: () => void;
}

export function UserProfileCard({ profile, stats, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${profile.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preferred Virtue */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Preferred Virtue
            </Label>
            {isEditing ? (
              <Select
                value={editedProfile.preferred_virtue || ""}
                onValueChange={(value) =>
                  setEditedProfile({ ...editedProfile, preferred_virtue: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select virtue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wisdom">Wisdom</SelectItem>
                  <SelectItem value="justice">Justice</SelectItem>
                  <SelectItem value="temperance">Temperance</SelectItem>
                  <SelectItem value="courage">Courage</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 text-sm text-gray-900">
                {profile.preferred_virtue || "Not set"}
              </div>
            )}
          </div>

          {/* Preferred Persona */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Preferred Persona
            </Label>
            {isEditing ? (
              <Select
                value={editedProfile.preferred_persona || ""}
                onValueChange={(value) =>
                  setEditedProfile({ ...editedProfile, preferred_persona: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marcus">Marcus Aurelius</SelectItem>
                  <SelectItem value="lao">Laozi</SelectItem>
                  <SelectItem value="simone">Simone de Beauvoir</SelectItem>
                  <SelectItem value="epictetus">Epictetus</SelectItem>
                  <SelectItem value="aristotle">Aristotle</SelectItem>
                  <SelectItem value="plato">Plato</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 text-sm text-gray-900">
                {profile.preferred_persona || "Not set"}
              </div>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Experience Level
            </Label>
            {isEditing ? (
              <Select
                value={editedProfile.experience_level || ""}
                onValueChange={(value) =>
                  setEditedProfile({ ...editedProfile, experience_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 text-sm text-gray-900">
                {profile.experience_level || "Beginner"}
              </div>
            )}
          </div>

          {/* Timezone */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Timezone</Label>
            <div className="mt-1 text-sm text-gray-900">{profile.timezone}</div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Notifications
            </Label>
            <Badge variant={profile.notifications_enabled ? "default" : "secondary"}>
              {profile.notifications_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          {/* Privacy Level */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Privacy Level
            </Label>
            <Badge variant="outline">{profile.privacy_level}</Badge>
          </div>

          {/* Admin Status */}
          {isEditing && (
            <div className="flex items-center justify-between pt-2 border-t">
              <Label className="text-sm font-medium text-gray-700">
                Admin Access
              </Label>
              <Select
                value={editedProfile.is_admin ? "true" : "false"}
                onValueChange={(value) =>
                  setEditedProfile({ ...editedProfile, is_admin: value === "true" })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">
                {stats.habitsCount}
              </div>
              <div className="text-sm text-blue-600">Habits Created</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">
                {stats.reflectionsCount}
              </div>
              <div className="text-sm text-purple-600">Reflections</div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Onboarding Status</span>
              <Badge
                variant={profile.onboarding_complete ? "default" : "secondary"}
              >
                {profile.onboarding_complete ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
