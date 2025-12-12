import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables FIRST - before any other imports
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log('✅ Loaded .env.local');
} else if (existsSync(envPath)) {
  config({ path: envPath });
  console.log('✅ Loaded .env');
} else {
  console.warn('⚠️ No .env or .env.local file found');
}

// Verify MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Use dynamic import to ensure env vars are loaded first
async function seedProducts() {
  const { default: connectDB } = await import('@/lib/mongodb');
  const { default: Product } = await import('@/models/Product');

  const products = [
    {
      title: "Wireless Earbuds",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
      category: "Electronics",
      price: 99.99,
      availability: true,
      description: "High-quality wireless earbuds with noise cancellation and long battery life. Perfect for music lovers and professionals on the go."
    },
    {
      title: "Classic Denim Jeans",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
      category: "Clothing",
      price: 79.99,
      availability: true,
      description: "Comfortable and stylish denim jeans with a perfect fit. Made from premium quality cotton denim for durability and comfort."
    },
    {
      title: "Running Sneakers",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      category: "Shoes",
      price: 129.99,
      availability: true,
      description: "Lightweight running sneakers with excellent cushioning and breathable mesh upper. Ideal for daily runs and workouts."
    },
    {
      title: "Leather Watch",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      category: "Accessories",
      price: 199.99,
      availability: true,
      description: "Elegant leather strap watch with a classic design. Perfect for both casual and formal occasions."
    },
    {
      title: "Smartphone Case",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500",
      category: "Electronics",
      price: 29.99,
      availability: true,
      description: "Protective smartphone case with shock absorption technology. Available in multiple colors to match your style."
    },
    {
      title: "Cotton T-Shirt",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      category: "Clothing",
      price: 24.99,
      availability: true,
      description: "Soft and comfortable cotton t-shirt in various colors. Perfect for everyday wear with a relaxed fit."
    },
    {
      title: "Casual Loafers",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
      category: "Shoes",
      price: 89.99,
      availability: true,
      description: "Comfortable casual loafers made from genuine leather. Great for office wear and weekend outings."
    },
    {
      title: "Sunglasses",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
      category: "Accessories",
      price: 49.99,
      availability: true,
      description: "Stylish sunglasses with UV protection. Modern design with polarized lenses for optimal eye protection."
    }
  ];

  try {
    await connectDB();
    
    // Clear existing products (optional - remove if you want to keep existing data)
    // await Product.deleteMany({});
    
    // Generate slugs and insert products
    const productsWithSlugs = products.map(product => {
      const slug = product.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      return {
        ...product,
        slug
      };
    });

    const result = await Product.insertMany(productsWithSlugs);
    console.log(`✅ Successfully seeded ${result.length} products!`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
