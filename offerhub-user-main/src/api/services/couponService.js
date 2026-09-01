import apiClient from "../client";

// export const getCoupons = async () => {
//   const response = await apiClient.get("/coupon");
//   return response.data;
// };

export const couponService = {
  getCoupons: async () => {
    const response = await apiClient.get("/coupon");
    return response.data;
  },
  applyCoupon: async (couponId) => {
    const response = await apiClient.post("/coupon/apply", { couponId });
    return response.data;
  },
  removeCoupon: async () => {
    const response = await apiClient.patch("/coupon");
    return response.data;
  },
};
