"use client";

import QueryEditor from "@/components/query-editor/QueryEditor";
import QueryResult from "@/components/query-editor/QueryResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function QueryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Query Editor</h1>
        <p className="text-muted-foreground">
          Write and execute SQL SELECT queries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SQL Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryEditor />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Query Results</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryResult />
        </CardContent>
      </Card>
    </div>
  );
}
