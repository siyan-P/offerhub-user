import apiClient from "../client";

export const productService = {
  getAllProducts: async () => {
    const response = await apiClient.get("/product/get-products");
    return response.data;
  },
  getProductById: async (id) => {
    const response = await apiClient.get(`/product/get-product/${id}`);
    return response.data;
  },
};
