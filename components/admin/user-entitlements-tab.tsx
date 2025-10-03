"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Gift, Calendar, XCircle } from "lucide-react";
import { GrantEntitlementDialog } from "./grant-entitlement-dialog";
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

interface Props {
  userId: string;
  entitlements: Entitlement[];
  purchases: Purchase[];
  onUpdate: () => void;
}

export function UserEntitlementsTab({ userId, entitlements, purchases, onUpdate }: Props) {
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [revokeEntitlementId, setRevokeEntitlementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRevokeEntitlement = async () => {
    if (!revokeEntitlementId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/entitlements/${revokeEntitlementId}/revoke`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Entitlement Revoked",
          description: "User access has been revoked successfully.",
        });
        onUpdate();
      } else {
        throw new Error("Failed to revoke entitlement");
      }
    } catch (error) {
      console.error("Failed to revoke entitlement:", error);
      toast({
        title: "Error",
        description: "Failed to revoke entitlement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRevokeEntitlementId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Active Entitlements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Entitlements</CardTitle>
            <Button onClick={() => setShowGrantDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Grant Entitlement
            </Button>
          </CardHeader>
          <CardContent>
            {entitlements.filter((e) => e.is_active).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active entitlements
              </div>
            ) : (
              <div className="space-y-3">
                {entitlements
                  .filter((e) => e.is_active)
                  .map((entitlement) => (
                    <div
                      key={entitlement.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {entitlement.products.name}
                          </h4>
                          <Badge
                            variant={
                              entitlement.source === "stripe" ? "default" : "secondary"
                            }
                          >
                            {entitlement.source === "stripe" ? (
                              <ShoppingCart className="h-3 w-3 mr-1" />
                            ) : (
                              <Gift className="h-3 w-3 mr-1" />
                            )}
                            {entitlement.source}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {entitlement.products.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Granted {new Date(entitlement.granted_at).toLocaleDateString()}
                          </div>
                          {entitlement.expires_at && (
                            <div>
                              Expires {new Date(entitlement.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRevokeEntitlementId(entitlement.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No purchases
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {purchase.products.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {purchase.products.description}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${(purchase.amount / 100).toFixed(2)} {purchase.currency.toUpperCase()}
                      </div>
                      <Badge
                        variant={
                          purchase.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revoked Entitlements */}
        {entitlements.filter((e) => !e.is_active).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revoked Entitlements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entitlements
                  .filter((e) => !e.is_active)
                  .map((entitlement) => (
                    <div
                      key={entitlement.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-700">
                            {entitlement.products.name}
                          </h4>
                          <Badge variant="outline">Revoked</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Granted {new Date(entitlement.granted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grant Entitlement Dialog */}
      <GrantEntitlementDialog
        userId={userId}
        open={showGrantDialog}
        onOpenChange={setShowGrantDialog}
        onSuccess={onUpdate}
      />

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={!!revokeEntitlementId}
        onOpenChange={() => setRevokeEntitlementId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Entitlement</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately remove the user&apos;s access to this premium persona.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeEntitlement}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Revoking..." : "Revoke Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
