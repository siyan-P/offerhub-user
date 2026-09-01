import apiClient from "../client";

// export const loginService = {
//   login: async (email, password) => {
//     const response = await apiClient.post("/user/login", { email, password });
//     return response.data;
//   },
// };

export const authService = {
  checkAuth: async () => {
    const response = await apiClient.get("/user/check-user");
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post("/user/login", { email, password });
    return response.data;
  },

  signup: async (user) => {
    const response = await apiClient.post("/user/register", user);
    return response.data;
  },
};
