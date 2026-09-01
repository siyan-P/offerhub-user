import apiClient from "../client";

export const categoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get("/category/allcategories");
    return response.data;
  },
};
