import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../../api/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser, setIsLoggedIn } from "../../redux/features/user/userSlice";
import { handleRedirectAfterLogin } from "../../utils/redirectUtils";
export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
   onSuccess: (data) => {
  localStorage.setItem("user-auth-token", data.token);
  dispatch(setUser(data.user));
  dispatch(setIsLoggedIn(true));

  handleRedirectAfterLogin(navigate); // <-- THIS triggers the redirect
},

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to login");
    },
  });
};

export const useCheckAuth = () => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ["check-auth"],
    queryFn: () => authService.checkAuth(),
    retry: 1,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(setIsLoggedIn(true));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to check auth");
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (user) => authService.signup(user),
    onSuccess: (data) => {
      localStorage.setItem("user-auth-token", data.token);
      dispatch(setUser(data.user));
      dispatch(setIsLoggedIn(true));
      toast.success("Signup successful");
      
      // Handle redirect after signup using utility function
      handleRedirectAfterLogin(navigate);
    },
    onError: (error) => {
      // toast.error(error.response?.data?.message || "Failed to signup");
      return error.response?.data?.message;
    },
  });
};
