import { useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "../../api/services/userService";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser, setIsLoggedIn } from "../../redux/features/user/userSlice";

export const useUpdateUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user) => userService.updateUser(user),
    onSuccess: (response) => {
      toast.success("User updated successfully");
      if (response) {
        dispatch(setUser(response));
        dispatch(setIsLoggedIn(true));
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useSubscribe = () => {
  return useMutation({
    mutationFn: (data) => userService.subscribe(data),
    // onSuccess: (response) => {
    //   toast.success("Subscribed successfully");
    // },
    // onError: (error) => {
    //   toast.error(error?.response?.data?.message || error.message);
    // },
  });
};
