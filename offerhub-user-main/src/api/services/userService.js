import apiClient from "../client";

const userService = {
  updateUser: async (user) => {
    const response = await apiClient.patch("/user/update-user", user);
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await apiClient.patch(`/user/delete-address/${id}`);
    return response.data;
  },
  getAuthUser: async () => {
    const response = await apiClient.get("/user/check-user");
    return response.data;
  },
  subscribe: async (data) => {
    const response = await apiClient.post("/user/submit-user-details", data);
    return response.data;
  },
};

export default userService;
