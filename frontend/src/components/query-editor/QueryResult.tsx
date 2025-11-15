"use client";

import React from "react";
import { useQueryStore } from "@/lib/store/queryStore";

export default function QueryResult() {
  const { result, error, loading } = useQueryStore();

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Executing query...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-400">Error</p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">No results. Run a query to see results.</p>
      </div>
    );
  }

  // Handle SELECT results
  if (result.type === 'SELECT') {
    const { columns, rows, executionTime } = result;

    if (rows.length === 0) {
      return (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">No rows returned</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {executionTime && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Execution time: {executionTime}ms • {rows.length} row{rows.length !== 1 ? 's' : ''}
          </p>
        )}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200"
                      >
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : 'NULL'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Handle DML results (INSERT, UPDATE, DELETE)
  if (result.type === 'DML') {
    const { status, rowsAffected, message } = result;

    if (status === 'error') {
      return (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-400">DML Error</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message || 'Query failed'}</p>
        </div>
      );
    }

    return (
      <div className="border border-green-300 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-400">Query OK</p>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          {message || `Query OK, ${rowsAffected} row(s) affected`}
        </p>
      </div>
    );
  }

  // Handle DDL results (CREATE, ALTER, DROP, TRUNCATE)
  if (result.type === 'DDL') {
    const { status, message } = result;

    if (status === 'error') {
      return (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-400">DDL Error</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message || 'Query failed'}</p>
        </div>
      );
    }

    return (
      <div className="border border-purple-300 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
        <p className="text-sm font-medium text-purple-800 dark:text-purple-400">Query OK</p>
        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">{message}</p>
      </div>
    );
  }

  return null;
}
