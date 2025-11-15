"use client";

import React, { useState, useEffect } from "react";
import { dbService, DatabaseSchema } from "@/lib/api/dbService";
import Button from "@/components/ui/button/Button";
import { ArrowRightIcon } from "@/icons";

interface TreeNodeProps {
  name: string;
  type: 'schema' | 'table' | 'column';
  children?: React.ReactNode;
  onClick?: () => void;
}

function TreeNode({ name, type, children, onClick }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(type === 'schema');

  const icons = {
    schema: '🗄️',
    table: '📊',
    column: '📋',
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
        onClick={() => {
          if (children) setIsExpanded(!isExpanded);
          if (onClick) onClick();
        }}
      >
        {children && (
          <span className="text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span className="text-sm">{icons[type]}</span>
        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
      </div>
      {isExpanded && children && (
        <div className="ml-4 border-l border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DatabaseTree() {
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const data = await dbService.getSchema();
      setSchemas(data);
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        Loading schema...
      </div>
    );
  }

  if (schemas.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        No databases found. Create an instance to get started.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between p-2 mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Schema</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchSchema}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ArrowRightIcon className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>
      <div className="p-2">
        {schemas.map((schema) => (
          <TreeNode key={schema.name} name={schema.name} type="schema">
            {schema.tables.map((table) => (
              <TreeNode key={table.name} name={table.name} type="table">
                {table.columns.map((column) => (
                  <TreeNode
                    key={column.name}
                    name={`${column.name} (${column.type})`}
                    type="column"
                  />
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        ))}
      </div>
    </div>
  );
}

