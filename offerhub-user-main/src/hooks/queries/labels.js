import { useQuery } from "@tanstack/react-query";
import { labelService } from "../../api/services/labelService";

export const useLabels = () => {
  return useQuery({
    queryKey: ["labels"],
    queryFn: labelService.getAllLabels,
  });
};
