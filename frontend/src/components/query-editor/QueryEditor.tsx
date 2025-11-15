"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useQueryStore, detectQueryType, QueryType } from "@/lib/store/queryStore";
import { dbService } from "@/lib/api/dbService";
import Button from "@/components/ui/button/Button";
import { PaperPlaneIcon, TrashBinIcon } from "@/icons";
import { useAuthStore } from "@/lib/store/authStore";

// Dynamic import Monaco Editor để tránh SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-900">
      <p className="text-sm text-gray-500">Loading editor...</p>
    </div>
  ),
});

export default function QueryEditor() {
  const { query, setQuery, setResult, setError, setLoading, setQueryType, clearResult, loading, queryType } = useQueryStore();
  const { user } = useAuthStore();
  const userRole = user?.role || "";

  // Auto-detect query type when query changes
  React.useEffect(() => {
    const detectedType = detectQueryType(query);
    setQueryType(detectedType);
  }, [query, setQueryType]);

  const handleRun = async () => {
    if (!query.trim()) {
      setError("Query cannot be empty");
      return;
    }

    // Detect query type
    const detectedType = detectQueryType(query);
    if (!detectedType) {
      setError("Unable to detect query type. Please start with SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, or DROP");
      return;
    }

    // Check role permissions
    if (detectedType === 'DML' || detectedType === 'DDL') {
      const allowedRoles = ['Developer', 'TenantAdmin', 'admin', 'SuperAdmin'];
      if (!allowedRoles.includes(userRole)) {
        setError(`Only Developer, TenantAdmin, Admin, or SuperAdmin roles can execute ${detectedType} queries`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setQueryType(detectedType);

    try {
      let result;

      if (detectedType === 'SELECT') {
        const selectResult = await dbService.executeSelect(query);
        result = {
          type: 'SELECT' as const,
          columns: selectResult.columns,
          rows: selectResult.rows,
          executionTime: selectResult.executionTime,
        };
      } else if (detectedType === 'DML') {
        const dmlResult = await dbService.executeDML(query);
        result = {
          type: 'DML' as const,
          status: dmlResult.status,
          rowsAffected: dmlResult.rows_affected,
          message: dmlResult.message,
        };
      } else if (detectedType === 'DDL') {
        const ddlResult = await dbService.executeDDL(query);
        result = {
          type: 'DDL' as const,
          status: ddlResult.status,
          message: ddlResult.message,
        };
      } else {
        throw new Error('Unknown query type');
      }

      setResult(result);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Query execution failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    clearResult();
  };

  const getQueryTypeBadge = () => {
    if (!queryType) return null;
    const colors = {
      SELECT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      DML: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      DDL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[queryType]}`}>
        {queryType}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={loading || !queryType}
            className="flex items-center gap-2"
          >
            <PaperPlaneIcon />
            {loading ? "Running..." : "Run Query"}
          </Button>
          {getQueryTypeBadge()}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleClear}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <TrashBinIcon />
          Clear
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <MonacoEditor
          height="400px"
          defaultLanguage="sql"
          theme="vs-dark"
          value={query}
          onChange={(value) => setQuery(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

