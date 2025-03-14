
/**
 * Product fixtures for testing Railway DB services
 */
import { Product } from "../../types";

/**
 * Sample products for testing
 */
export const sampleProducts: Product[] = [
  {
    id: "1",
    reference: "ABC123",
    barcode: "123456789",
    description: "Test Product 1",
    brand: "Test Brand",
    location: "A1",
    imageUrl: "https://example.com/image1.jpg",
    catalog: "Main",
    prices: [
      { type: "retail", value: 19.99 },
      { type: "wholesale", value: 14.99 }
    ]
  },
  {
    id: "2",
    reference: "DEF456",
    barcode: "987654321",
    description: "Test Product 2",
    brand: "Another Brand",
    location: "B2",
    imageUrl: "https://example.com/image2.jpg",
    catalog: "Secondary",
    prices: [
      { type: "retail", value: 29.99 },
      { type: "wholesale", value: 24.99 }
    ],
    eco: {
      tax: 1.50
    }
  }
];
