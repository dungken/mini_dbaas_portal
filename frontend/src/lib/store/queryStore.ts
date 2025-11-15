// Query Store - Zustand store cho Query Editor state

import { create } from 'zustand';

export type QueryType = 'SELECT' | 'DML' | 'DDL';

export interface SelectResult {
  type: 'SELECT';
  columns: string[];
  rows: Record<string, any>[];
  executionTime?: number;
}

export interface DMLResult {
  type: 'DML';
  status: 'ok' | 'error';
  rowsAffected: number;
  message?: string;
}

export interface DDLResult {
  type: 'DDL';
  status: 'ok' | 'error';
  message: string;
}

export type QueryResult = SelectResult | DMLResult | DDLResult | null;

interface QueryState {
  query: string;
  queryType: QueryType | null;
  result: QueryResult;
  error: string | null;
  loading: boolean;
  setQuery: (query: string) => void;
  setQueryType: (type: QueryType | null) => void;
  setResult: (result: QueryResult) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearResult: () => void;
}

export const useQueryStore = create<QueryState>((set) => ({
  query: 'SELECT * FROM users LIMIT 10;',
  queryType: 'SELECT',
  result: null,
  error: null,
  loading: false,
  setQuery: (query) => set({ query }),
  setQueryType: (type) => set({ queryType: type }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, result: null }),
  setLoading: (loading) => set({ loading }),
  clearResult: () => set({ result: null, error: null, queryType: null }),
}));

/**
 * Detect query type from SQL query string
 */
export function detectQueryType(query: string): QueryType | null {
  const trimmedQuery = query.trim().toUpperCase();

  if (trimmedQuery.startsWith('SELECT')) {
    return 'SELECT';
  }

  // DML: INSERT, UPDATE, DELETE
  if (trimmedQuery.startsWith('INSERT') ||
    trimmedQuery.startsWith('UPDATE') ||
    trimmedQuery.startsWith('DELETE')) {
    return 'DML';
  }

  // DDL: CREATE, ALTER, DROP, TRUNCATE
  if (trimmedQuery.startsWith('CREATE') ||
    trimmedQuery.startsWith('ALTER') ||
    trimmedQuery.startsWith('DROP') ||
    trimmedQuery.startsWith('TRUNCATE')) {
    return 'DDL';
  }

  return null;
}

