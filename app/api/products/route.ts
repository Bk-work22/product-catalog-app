import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET all products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');
    const limit = searchParams.get('limit');

    let query: any = {};

    // Filter by category (supports multiple categories as comma-separated)
    if (category) {
      const categories = category.split(',').map(c => c.trim()).filter(c => c);
      if (categories.length > 0) {
        query.category = { $in: categories };
      }
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortOptions: any = {};
    if (sortBy === 'low') {
      sortOptions.price = 1;
    } else if (sortBy === 'high') {
      sortOptions.price = -1;
    }

    let productsQuery = Product.find(query).sort(sortOptions);
    
    if (limit) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }

    const products = await productsQuery.lean();

    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, image, category, price, availability, description } = body;

    // Validation
    if (!title || !image || !category || price === undefined || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const generateSlug = (title: string): string => {
      let slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (!slug) {
        slug = `product-${Date.now()}`;
      }
      
      return slug;
    };

    const slug = generateSlug(title);

    // Create product with slug (pre-validate hook will also generate it, but this ensures it's set)
    const product = new Product({
      title,
      image,
      category,
      price: parseFloat(price),
      availability: availability !== undefined ? availability : true,
      description,
      slug, // Set slug explicitly to avoid validation errors
    });

    await product.save();

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A product with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

