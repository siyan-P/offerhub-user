import apiClient from "../client";
import { useDispatch } from "react-redux";
import { setUser, setIsLoggedIn } from "../../redux/features/user/userSlice";

const refetchUser = async () => {
  const dispatch = useDispatch();
  const data = await apiClient.get("/user/check-user");
  if (data.status === 200) {
    dispatch(setUser(data.user));
    dispatch(setIsLoggedIn(true));
  }
};

export default refetchUser;
