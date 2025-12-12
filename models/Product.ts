import mongoose, { model, models, Schema } from "mongoose";

export interface IProduct {
    _id?: mongoose.Types.ObjectId;
    title: string;
    image: string;
    category: string;
    price: number;
    availability: boolean;
    slug: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema = new Schema<IProduct>({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    availability: {
        type: Boolean,
        default: true,
    },
    slug: {
        type: String,
        required: false, // Auto-generated, so not required in input
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true
    }
);

// Note: Slug is generated in the API route (app/api/products/route.ts)
// before creating the Product document to ensure it's set before validation

export const Product = models?.Product || model<IProduct>("Product", productSchema);

export default Product;

