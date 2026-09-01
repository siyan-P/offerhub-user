import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import cartService from "../../api/services/cartService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { storeRedirectPath } from "../../utils/redirectUtils";
import { useDispatch } from "react-redux";
import { setCart } from "../../redux/features/cart/cartSlice";

const CART_KEY = ["cart"];

/**
 * Recompute the cart's derived totals after an optimistic edit, so the summary
 * doesn't lag a beat behind the line items. Coupon maths stays server-owned:
 * when a coupon is applied we leave `finalAmount` alone and let the refetch
 * settle it rather than guessing at the discount rules here.
 */
function recalculate(cart) {
  const formatted = cart?.data?.formattedCart;
  if (!formatted?.items) return cart;

  const subTotal = formatted.items.reduce(
    (sum, item) => sum + (item.offerPrice || 0) * (item.quantity || 0),
    0
  );

  formatted.subTotal = subTotal;
  formatted.totalPrice = subTotal;

  const hasCoupon = Object.keys(cart.data.couponDetails || {}).length > 0;
  if (!hasCoupon) {
    cart.data.finalAmount = subTotal + (cart.data.deliveryCharges || 0);
  }

  return cart;
}

// Get cart items
export const useCart = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("user-auth-token");

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: CART_KEY,
    queryFn: cartService.getCart,
    enabled: !!token, // Only run query if token exists
  });

  // Mirroring into Redux has to happen after commit — dispatching during render
  // updates the store while another component is rendering, which React warns
  // about and which can drop the update.
  useEffect(() => {
    dispatch(setCart(data?.data?.formattedCart));
  }, [data, dispatch]);

  return { data, isLoading, isFetching, error, refetch };
};

// Add to cart mutation
export const useAddToCart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // React Query v5 renamed the mutation flag to `isPending`; the old `isLoading`
  // read as `undefined`, so every add-to-cart spinner in the app was dead.
  const { mutate, isPending } = useMutation({
    mutationFn: ({ productId, variantId, quantity }) =>
      cartService.addToCart(productId, variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Added to cart");
    },
    onError: (error) => {
      if (error.status === 401 || error.response?.status === 401) {
        toast.error("Please log in to add items to your cart");
        storeRedirectPath(window.location.pathname + window.location.search);
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Couldn't add this to your cart"
        );
      }
    },
  });

  return { mutate, isPending, isLoading: isPending };
};

/**
 * Update quantity — applied optimistically and rolled back if the server
 * rejects it, so the stepper responds instantly instead of blanking the page.
 */
export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId, action }) =>
      cartService.updateQuantity(productId, variantId, action),
    onMutate: async ({ productId, variantId, action }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData(CART_KEY);
      if (!previous) return { previous };

      const next = structuredClone(previous);
      const item = next?.data?.formattedCart?.items?.find(
        (entry) =>
          entry.product?._id === productId &&
          (variantId ? entry.variant?._id === variantId : true)
      );

      if (item) {
        item.quantity = Math.max(
          1,
          item.quantity + (action === "increment" ? 1 : -1)
        );
        queryClient.setQueryData(CART_KEY, recalculate(next));
      }

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_KEY, context.previous);
      }
      toast.error(
        error.response?.data?.message || "Couldn't update the quantity"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
};

/** Remove from cart — same optimistic/rollback treatment. */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }) =>
      cartService.removeFromCart(productId, variantId),
    onMutate: async ({ productId, variantId }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData(CART_KEY);
      if (!previous) return { previous };

      const next = structuredClone(previous);
      const items = next?.data?.formattedCart?.items;
      if (items) {
        next.data.formattedCart.items = items.filter(
          (entry) =>
            !(
              entry.product?._id === productId &&
              (variantId ? entry.variant?._id === variantId : true)
            )
        );
        queryClient.setQueryData(CART_KEY, recalculate(next));
      }

      return { previous };
    },
    onSuccess: () => {
      toast.success("Removed from your cart");
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_KEY, context.previous);
      }
      toast.error(
        error.response?.data?.message || "Couldn't remove that item"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
};

// Clear cart mutation
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Cart cleared");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Couldn't clear your cart");
    },
  });
};
