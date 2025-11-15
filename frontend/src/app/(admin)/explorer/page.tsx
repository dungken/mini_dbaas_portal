"use client";

import DatabaseTree from "@/components/db-explorer/DatabaseTree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ExplorerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Explorer</h1>
        <p className="text-muted-foreground">
          Browse and explore your database schemas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <DatabaseTree />
        </CardContent>
      </Card>
    </div>
  );
}
