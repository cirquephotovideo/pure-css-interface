
export interface TableConfig {
  name: string;
  enabled: boolean;
  searchFields: string[];
  displayFields: string[];
  columnMapping?: Record<string, string>;
}
