import apiClient from "../client";

const cartService = {
  // Get cart items
  getCart: async () => {
    const response = await apiClient.get("/cart/get-cart");
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, variantId = null, quantity = 1) => {
    const response = await apiClient.post("/cart/add-to-cart", {
      productId,
      variantId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateQuantity: async (productId, variantId, action) => {
    const response = await apiClient.patch(`/cart/update-cart-quantity`, {
      productId,
      variantId,
      action,
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId, variantId) => {
    const response = await apiClient.delete(`/cart/remove-from-cart`, {
      data: { productId, variantId },
    });
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await apiClient.delete("/cart/clear-cart");
    return response.data;
  },

  checkStock: async () => {
    const response = await apiClient.get("/cart/check-stock");
    return response.data;
  },
};

export default cartService;
