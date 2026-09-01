import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/client";

export const useOfferBanner = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["offer-banner"],
    queryFn: () => apiClient.get("/offerBanner"),
  });
  const offerBanner = data?.data?.data;

  return { offerBanner, isLoading, error };
};
