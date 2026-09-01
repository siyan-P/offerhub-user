import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import orderService from "../../api/services/orderServices";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const usePlaceOrder = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (address) => orderService.placeOrder(address),
    onSuccess: () => {
      toast.success("Order placed successfully");
      navigate("/profile?tab=order-history");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });
};

export const useGetOrderHistory = () => {
  return useQuery({
    queryKey: ["order-history"],
    queryFn: () => orderService.getOrderHistory(),
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to get order history"
      );
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId, status = "cancelled", type = "order") => {
      return orderService.updateOrderStatus(orderId, status, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-history"] });
      toast.success("Order status updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    },
  });
};
