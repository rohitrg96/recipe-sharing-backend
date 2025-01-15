import { PipelineStage } from 'mongoose';

export const mockRecipes = [{ title: 'Recipe 1' }, { title: 'Recipe 2' }];

export const mockTotalCount = [{ totalCount: 10 }];

export const mockPipeline: PipelineStage[] = [{ $match: {} }];

export const filtersWithResults = {
  ingredients: 'tomato',
  title: 'Soup',
  minRating: '4',
  maxPreparationTime: '30',
  page: '1',
  limit: '2',
};

export const filtersWithNoResults = {
  ingredients: '',
  title: '',
  minRating: '0',
  maxPreparationTime: '0',
  page: '1',
  limit: '10',
};
