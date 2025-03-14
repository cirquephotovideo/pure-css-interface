
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeRailwayQuery } from '../queryService';
import { searchProducts } from '../productService';
import { SearchResult } from '../productService';

// Mock the queryService module
vi.mock('../queryService', () => ({
  executeRailwayQuery: vi.fn(),
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty results when no tables are configured', async () => {
    // No tables in localStorage
    global.localStorage.setItem('railway_search_tables', JSON.stringify([]));

    const result = await searchProducts('test query');

    expect(result.data).toEqual([]);
    expect(result.data?.length || 0).toBe(0);
    expect(executeRailwayQuery).not.toHaveBeenCalled();
  });

  it('should return results from all enabled tables', async () => {
    // Mock localStorage with some enabled tables
    global.localStorage.setItem('railway_search_tables', JSON.stringify([
      {
        name: 'products',
        enabled: true,
        searchFields: ['name', 'description'],
        displayFields: ['name', 'price'],
      },
      {
        name: 'raw_table',
        enabled: true,
        searchFields: ['product_name'],
        displayFields: ['product_name', 'cost'],
      },
      {
        name: 'disabled_table',
        enabled: false,
        searchFields: ['name'],
        displayFields: ['name'],
      },
    ]));

    // Mock the query execution
    (executeRailwayQuery as any).mockResolvedValueOnce({
      data: [{ id: 1, name: 'Test Product 1' }],
    });
    (executeRailwayQuery as any).mockResolvedValueOnce({
      data: [{ id: 2, product_name: 'Test Product 2' }],
    });

    const result = await searchProducts('test');

    expect(result.data?.length || 0).toBe(2);
    expect(executeRailwayQuery).toHaveBeenCalledTimes(2);
  });

  it('should handle errors from query execution', async () => {
    // Mock localStorage with enabled table
    global.localStorage.setItem('railway_search_tables', JSON.stringify([
      {
        name: 'products',
        enabled: true,
        searchFields: ['name'],
        displayFields: ['name'],
      },
    ]));

    // Mock query execution with error
    (executeRailwayQuery as any).mockResolvedValueOnce({
      error: 'Database error',
    });

    const result = await searchProducts('test');

    expect(result.data).toEqual(null);
    expect(result.error).toBe('Database error');
    expect(executeRailwayQuery).toHaveBeenCalledTimes(1);
  });
});
