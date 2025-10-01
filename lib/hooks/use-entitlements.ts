"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserEntitlements {
  [productId: string]: boolean;
}

interface EntitlementRow {
  product_id: string;
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<UserEntitlements>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEntitlements = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("entitlements")
        .select("product_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching entitlements:", error);
        setLoading(false);
        return;
      }

      const entitlementMap: UserEntitlements = {};
      data.forEach((entitlement: EntitlementRow) => {
        entitlementMap[entitlement.product_id] = true;
      });

      setEntitlements(entitlementMap);
    } catch (error) {
      console.error("Error in fetchEntitlements:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  const hasEntitlement = (productId: string): boolean => {
    return entitlements[productId] === true;
  };

  const refreshEntitlements = () => {
    setLoading(true);
    fetchEntitlements();
  };

  return {
    entitlements,
    loading,
    hasEntitlement,
    refreshEntitlements,
  };
}