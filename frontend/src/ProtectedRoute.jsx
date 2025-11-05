import { useEffect, useState } from "react";
import { Navigate,   Outlet,   useLocation } from "react-router-dom";
import useUserStorage from "./store/useUserStorage";
import { checkUserAuth } from "./api/user";
import Spinner from "./utils/Spinner";
import { Loader } from "lucide-react";

export const ProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { setUser, clearUser, isAuthenticated } = useUserStorage();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkUserAuth();
        if (result?.isAuthenticated) {
          setUser(result?.user);
        } else {
          clearUser();
        }
      } catch (error) {
        console.log(error);

        clearUser();
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, [setUser, clearUser]);

  if(isChecking){
    return <p className=" h-screen flex items-center justify-center">
        <Loader className="text-gray-700 animate-spin" /> 
    </p>
  }

  if(!isAuthenticated){
    return <Navigate to={'/user-login'} state={{from:location}} replace />
  }

  return <Outlet  />
};


export const PublicRoute = () =>{
    const isAuthenticated = useUserStorage(state => state.isAuthenticated)

    if(isAuthenticated){
        return <Navigate to="/"  replace />
    }

    return <Outlet />
}
