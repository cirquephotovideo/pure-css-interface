
/**
 * Tests for Railway DB queryService
 */
import { executeRailwayQuery } from "../queryService";
import { createMockQueryResult, mockFetchResponse, spyOnConsole } from "./test-utils";
import { sampleProducts } from "./fixtures/products";

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Railway DB queryService", () => {
  // Setup and teardown
  let consoleSpy: ReturnType<typeof spyOnConsole>;
  
  beforeEach(() => {
    mockFetch.mockClear();
    consoleSpy = spyOnConsole();
  });
  
  afterEach(() => {
    consoleSpy.restore();
  });
  
  // Import.meta.env mocks
  const originalEnv = { ...import.meta.env };
  beforeAll(() => {
    Object.defineProperty(import.meta, 'env', {
      get: () => ({
        VITE_RAILWAY_DB_CONNECTION_STRING: 'postgresql://postgres:password@host:5432/railway',
      })
    });
  });
  
  afterAll(() => {
    Object.defineProperty(import.meta, 'env', {
      get: () => originalEnv
    });
  });
  
  it("should execute a query successfully", async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce(
      mockFetchResponse(createMockQueryResult(sampleProducts, null))
    );
    
    const result = await executeRailwayQuery("SELECT * FROM products");
    
    expect(result.data).toEqual(sampleProducts);
    expect(result.count).toBe(2);
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
  
  it("should handle API errors", async () => {
    // Mock error response
    mockFetch.mockResolvedValueOnce(
      mockFetchResponse({ data: null, count: 0, error: "Database error" }, false, 500)
    );
    
    const result = await executeRailwayQuery("SELECT * FROM products");
    
    expect(result.data).toBeNull();
    expect(result.error).toContain("Erreur serveur Railway");
    expect(consoleSpy.error).toHaveBeenCalled();
  });
  
  it("should validate read-only queries", async () => {
    const result = await executeRailwayQuery("INSERT INTO products VALUES (1, 'test')");
    
    expect(result.error).toContain("Opération d'écriture détectée");
    expect(result.data).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
  
  it("should handle network errors", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    
    const result = await executeRailwayQuery("SELECT * FROM products");
    
    expect(result.data).toBeNull();
    expect(result.error).toContain("Erreur réseau");
    expect(consoleSpy.error).toHaveBeenCalled();
  });
});
