import { categoryAPI } from './api';

export const categoryService = {
  getAllCategories: async (page = 1, limit = 20) => {
    try {
      const response = await categoryAPI.getAllCategories(page, limit);
      return response.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await categoryAPI.getCategoryById(id);
      return response.category || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  searchCategories: async (keyword, page = 1, limit = 20) => {
    try {
      const response = await categoryAPI.searchCategories(keyword, page, limit);
      return response.categories || [];
    } catch (error) {
      console.error('Error searching categories:', error);
      return [];
    }
  }
};