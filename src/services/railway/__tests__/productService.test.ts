
/**
 * Tests for Railway DB productService
 */
import { fetchProducts, searchProducts } from "../productService";
import { executeRailwayQuery } from "../queryService";
import { createMockQueryResult } from "./test-utils";
import { sampleProducts } from "./fixtures/products";

// Mock the executeRailwayQuery function
jest.mock("../queryService", () => ({
  executeRailwayQuery: jest.fn()
}));

const mockedExecuteQuery = executeRailwayQuery as jest.MockedFunction<typeof executeRailwayQuery>;

describe("Railway DB productService", () => {
  beforeEach(() => {
    mockedExecuteQuery.mockClear();
  });
  
  it("should fetch products", async () => {
    // Setup mock return value
    mockedExecuteQuery.mockResolvedValueOnce(createMockQueryResult(sampleProducts, null));
    
    const result = await fetchProducts();
    
    expect(result.data).toEqual(sampleProducts);
    expect(result.count).toBe(2);
    expect(result.error).toBeNull();
    expect(mockedExecuteQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM products"), []);
  });
  
  it("should search products", async () => {
    // Setup mock return value
    mockedExecuteQuery.mockResolvedValueOnce(
      createMockQueryResult([sampleProducts[0]], null)
    );
    
    const searchTerm = "test";
    const result = await searchProducts(searchTerm);
    
    expect(result.data).toEqual([sampleProducts[0]]);
    expect(result.count).toBe(1);
    expect(result.error).toBeNull();
    expect(mockedExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining("ILIKE $1"),
      expect.arrayContaining([`%${searchTerm}%`])
    );
  });
  
  it("should handle empty search results", async () => {
    // Setup mock return value for empty results
    mockedExecuteQuery.mockResolvedValueOnce(createMockQueryResult([], null));
    
    const result = await searchProducts("nonexistent");
    
    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
    expect(result.error).toBeNull();
  });
  
  it("should propagate errors from queryService", async () => {
    // Setup mock return value for error
    const errorMessage = "Database connection error";
    mockedExecuteQuery.mockResolvedValueOnce(createMockQueryResult(null, errorMessage));
    
    const result = await fetchProducts();
    
    expect(result.data).toBeNull();
    expect(result.error).toBe(errorMessage);
  });
});
