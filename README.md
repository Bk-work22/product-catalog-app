# Product Management System

A full-stack e-commerce product management application built with Next.js, MongoDB, and Redux. Features include product CRUD operations, image uploads via Cloudinary, advanced filtering, and a modern UI with shadcn components.

## 🚀 Features

- **Product Management**
  - Create, Read, Update, Delete products
  - Auto-generated slugs from product titles
  - Image upload to Cloudinary
  - Product availability  tracking

- **Advanced Filtering**
  - Search products by title
  - Filter by category (multiple selection)
  - Price range filter (max price slider)
  - Sort by price (Low to High / High to Low)

- **Product Detail Page**
  - Full product information display
  - Related products from same category
  - Edit and Delete functionality

- **Modern UI**
  - Responsive design with Tailwind CSS
  - shadcn/ui components
  - Loading states and error handling
  - Smooth animations and transitions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or MongoDB Atlas account)
- **Cloudinary** account (for image uploads)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd assessment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/your-database-name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**How to get these values:**

- **MongoDB URI**: 
  - Local: `mongodb://localhost:27017/database-name`
  - Atlas: Get from MongoDB Atlas dashboard → Connect → Connection String

- **Cloudinary**: 
  - Sign up at [cloudinary.com](https://cloudinary.com)
  - Get credentials from Dashboard

### 4. Seed the Database

Run the seeder script to populate your database with sample products:

```bash
npm run seed
```

This will create 8 sample products across 4 categories (Electronics, Clothing, Shoes, Accessories).

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
assessment/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # Single product CRUD
│   │   │   └── route.ts          # Products list & create
│   │   └── upload/
│   │       └── route.ts          # Cloudinary image upload
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx          # Product detail page
│   ├── layout.tsx                # Root layout with Redux provider
│   └── page.tsx                  # Main products page
├── components/
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── lib/
│   ├── api.ts                    # API service functions
│   ├── hooks.ts                  # Redux typed hooks
│   ├── mongodb.ts                # MongoDB connection
│   ├── providers.tsx             # Redux provider
│   ├── store.ts                  # Redux store configuration
│   └── slices/                   # Redux slices
│       ├── productsSlice.ts
│       ├── formSlice.ts
│       └── filtersSlice.ts
├── models/
│   └── Product.ts                # Mongoose product model
├── scripts/
│   └── seed.ts                   # Database seeder
└── .env.local                    # Environment variables (create this)
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample products

## 🔧 Key Functionality

### Adding a Product

1. Click "Add Product" button
2. Fill in the form:
   - Title (required)
   - Image (upload to Cloudinary or enter URL)
   - Category (required)
   - Price (required)
   - Availability checkbox
   - Description (required)
3. Slug is auto-generated from title
4. Submit to create product

### Filtering Products

- **Search**: Type in search bar to filter by title
- **Category**: Check/uncheck categories to filter
- **Price**: Use slider to set maximum price
- **Sort**: Select "Low to High" or "High to Low"

### Viewing Product Details

- Click on any product card
- View full product information
- See related products from same category
- Edit or Delete product

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify `MONGODB_URI` is correct in `.env.local`
- Check MongoDB is running (if local)
- Verify network access (if using Atlas)

### Cloudinary Upload Fails

- Verify all Cloudinary credentials in `.env.local`
- Check API key permissions in Cloudinary dashboard

### Seeder Script Errors

- Ensure `.env.local` exists with `MONGODB_URI`
- Run `npm run seed` from project root
- Check MongoDB connection is working

## 📝 Notes

- Products are stored in MongoDB
- Images are uploaded to Cloudinary
- State management uses Redux Toolkit
- UI components from shadcn/ui
- All API routes have error handling with try-catch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for assessment purposes.
