import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "../../api/services/couponService";
import { toast } from "sonner";

export const useGetCoupons = () => {
  return useQuery({ queryKey: ["coupons"], queryFn: couponService.getCoupons });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId) => couponService.applyCoupon(couponId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]); // Refresh cart data
      toast.success("Coupon applied successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    },
  });
};

// Remove coupon mutation
export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => couponService.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]); // Refresh cart data
      toast.success("Coupon removed successfully!");
    },
  });
};
