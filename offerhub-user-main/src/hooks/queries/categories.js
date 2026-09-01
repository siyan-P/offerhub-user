import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../../api/services/categoryService";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAllCategories,
  });
};
