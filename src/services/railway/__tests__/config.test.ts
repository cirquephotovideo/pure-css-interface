
/**
 * Tests for Railway DB configuration
 */
import { parseDBConnectionString } from "../config";

describe("Railway DB config", () => {
  it("should parse PostgreSQL connection string correctly", () => {
    const connectionString = "postgresql://user:pass@host.com:5432/dbname";
    const parsed = parseDBConnectionString(connectionString);
    
    expect(parsed).toEqual({
      user: "user",
      password: "pass",
      host: "host.com",
      port: "5432",
      database: "dbname"
    });
  });
  
  it("should handle invalid connection strings", () => {
    expect(parseDBConnectionString("invalid-string")).toBeNull();
    expect(parseDBConnectionString("mysql://user:pass@host:3306/db")).toBeNull();
    expect(parseDBConnectionString(null)).toBeNull();
    expect(parseDBConnectionString(undefined)).toBeNull();
  });
  
  it("should handle connection strings with special characters in password", () => {
    const connectionString = "postgresql://user:p@ss/w0rd@host.com:5432/dbname";
    const parsed = parseDBConnectionString(connectionString);
    
    expect(parsed).toEqual({
      user: "user",
      password: "p@ss/w0rd",
      host: "host.com",
      port: "5432",
      database: "dbname"
    });
  });
});
