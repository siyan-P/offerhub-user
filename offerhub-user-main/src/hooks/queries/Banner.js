import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/client";

export const useBanners = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["banners"],
    queryFn: () => apiClient.get("/banner"),
  });

  const allBanners = data?.data?.data;
  return { allBanners, isLoading, error };
};

export const useCategoryBanners = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categoryBanners"],
    queryFn: () => apiClient.get(`/banner/get-all-banners-by-category`),
  });

  const allCategoryBanners = data?.data?.data;
  return { allCategoryBanners, isLoading, error };
};
