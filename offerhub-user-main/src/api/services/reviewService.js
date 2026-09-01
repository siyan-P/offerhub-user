import apiClient from "../client";

export const reviewService = {
  createReview: async (reviewData) => {
    const response = await apiClient.post("/review/add-review", reviewData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },
};
