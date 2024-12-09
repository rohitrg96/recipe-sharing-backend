import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  ingredients: string[];
  steps: string[];
  image: string | null;
  preparationTime?: number;
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
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const RecipeSchema = mongoose.model<IRecipe>('Recipe', recipeSchema);
