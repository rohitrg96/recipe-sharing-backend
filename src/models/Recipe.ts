import mongoose, { Schema, Document } from 'mongoose';

export interface IStar {
  user: mongoose.Types.ObjectId;
  rating: number;
}
export interface Icomment {
  user: mongoose.Types.ObjectId;
  comment: string;
}

export interface IRecipe extends Document {
  title: string;
  ingredients: string[];
  steps: string[];
  image: string | null;
  preparationTime?: number;
  stars?: IStar[];
  comments?: Icomment[];
}

const recipeSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    steps: { type: [String], required: true },
    image: { type: String },
    preparationTime: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
    stars: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Create indexes on title, ingredients, preparationTime, and stars.rating.
recipeSchema.index({ title: 1 });
recipeSchema.index({ ingredients: 1 });
recipeSchema.index({ preparationTime: 1 });
recipeSchema.index({ 'stars.rating': 1 });

export const RecipeSchema = mongoose.model<IRecipe>('Recipe', recipeSchema);
