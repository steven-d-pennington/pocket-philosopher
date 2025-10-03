"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, KeyRound, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/lib/hooks/use-toast";

interface Props {
  userId: string;
  onActionComplete: () => void;
}

export function AccountActionsPanel({ userId, onActionComplete }: Props) {
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDisableAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: true }),
      });

      if (response.ok) {
        toast({
          title: "Account Disabled",
          description: "User account has been disabled successfully.",
        });
        onActionComplete();
      } else {
        throw new Error("Failed to disable account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDisableDialog(false);
    }
  };

  const handleEnableAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: false }),
      });

      if (response.ok) {
        toast({
          title: "Account Enabled",
          description: "User account has been enabled successfully.",
        });
        onActionComplete();
      } else {
        throw new Error("Failed to enable account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowEnableDialog(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Password Reset Email Sent",
          description: "User will receive a password reset email shortly.",
        });
      } else {
        throw new Error("Failed to send reset email");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowResetDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              disabled={loading}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Reset Password
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDisableDialog(true)}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Disable Account
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowEnableDialog(true)}
              disabled={loading}
              className="text-green-600 hover:text-green-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Enable Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disable Account Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Disable User Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from logging in, but all their data will be
              preserved. The account can be re-enabled at any time. Are you sure you
              want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableAccount}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Disabling..." : "Disable Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Account Dialog */}
      <AlertDialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the user's ability to log in and access their account.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableAccount}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Enabling..." : "Enable Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Password Reset Email</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to the user's registered email
              address. They will be able to set a new password using the link in the
              email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
