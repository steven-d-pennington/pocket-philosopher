"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, ShoppingCart, Gift, Calendar, Download } from "lucide-react";
import { GrantEntitlementDialog } from "@/components/admin/grant-entitlement-dialog";

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
  profiles: {
    user_id: string;
    preferred_virtue: string | null;
    preferred_persona: string | null;
  };
}

interface Product {
  id: string;
  name: string;
}

export default function AdminEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEntitlements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: searchTerm,
        product: filterProduct,
        status: filterStatus,
        source: filterSource,
      });

      const response = await fetch(`/api/admin/entitlements?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntitlements(data.entitlements || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch entitlements:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filterProduct, filterStatus, filterSource]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEntitlements();
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log("Export to CSV");
  };

  if (loading && entitlements.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading entitlements...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entitlement Management</h1>
            <p className="mt-2 text-gray-600">
              Grant and manage user access to premium personas
            </p>
          </div>
          <Button onClick={() => setShowGrantDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Grant Entitlement
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search by user ID or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Select value={filterProduct} onValueChange={setFilterProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="stripe">Stripe Purchase</SelectItem>
                    <SelectItem value="manual_grant">Manual Grant</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 ml-auto">
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Entitlements Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Entitlements ({entitlements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {entitlements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No entitlements found</p>
                <p className="text-sm mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {entitlements.map((entitlement) => (
                    <div
                      key={entitlement.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        !entitlement.is_active ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {entitlement.products.name}
                          </h4>
                          <Badge
                            variant={entitlement.is_active ? "default" : "outline"}
                          >
                            {entitlement.is_active ? "Active" : "Revoked"}
                          </Badge>
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
                        <div className="text-sm text-gray-600 mt-1">
                          User: {entitlement.user_id.slice(0, 8)}...
                          {entitlement.profiles?.preferred_persona && (
                            <> • Preferred: {entitlement.profiles.preferred_persona}</>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Granted {new Date(entitlement.granted_at).toLocaleDateString()}
                          </div>
                          {entitlement.expires_at && (
                            <div>
                              Expires{" "}
                              {new Date(entitlement.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/admin/users/${entitlement.user_id}`;
                          }}
                        >
                          View User
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grant Entitlement Dialog */}
      <GrantEntitlementDialog
        userId=""
        open={showGrantDialog}
        onOpenChange={setShowGrantDialog}
        onSuccess={fetchEntitlements}
      />
    </AdminLayout>
  );
}
