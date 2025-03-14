
/**
 * Tests for Railway DB utilities
 */
import { isReadOnlyQuery } from "../utils";

describe("Railway DB utils", () => {
  it("should identify read-only queries correctly", () => {
    // Valid read-only queries
    expect(isReadOnlyQuery("SELECT * FROM products")).toBe(true);
    expect(isReadOnlyQuery("  SELECT id FROM users WHERE name = 'test'")).toBe(true);
    expect(isReadOnlyQuery("select * from products")).toBe(true);
    
    // Non-read-only queries
    expect(isReadOnlyQuery("INSERT INTO products VALUES (1, 'test')")).toBe(false);
    expect(isReadOnlyQuery("UPDATE products SET name = 'test' WHERE id = 1")).toBe(false);
    expect(isReadOnlyQuery("DELETE FROM products WHERE id = 1")).toBe(false);
    expect(isReadOnlyQuery("DROP TABLE products")).toBe(false);
    expect(isReadOnlyQuery("CREATE TABLE test (id int)")).toBe(false);
  });
});
