
import { SecurityView } from "@/components/dashboard/security-view";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTroopConfigurations } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calcularStatsTropaConBonus } from "@/lib/formulas/troop-formulas";
import { SECURITY_TROOP_ORDER, TROOP_TYPE_DEFENSE } from "@/lib/constants";

function SecurityLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full shimmer" />
            ))