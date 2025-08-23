import { createContext, useContext, useEffect, useState } from "react";
import { User } from "./types";
import Cookies from "js-cookie";
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from "./axios";
import constant from "./constant";
 


interface AuthContextProps {
    user? : User | null;
    isLoading : boolean;
    login : (accessToken : string , user : User) =>void;
    setUser : (user : User | null) => void;
    logout : () => Promise<void>;

}

const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
    children : React.ReactNode;
}

export const AuthProvider = ({children} : AuthProviderProps ) =>{
    const [user , setUser] = useState<User | null>(null);
    const queryClient = useQueryClient();

    // // Fetch the user details if a refresh token is present
   const { isLoading, data } = useQuery<User>({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/profile");
      return res.data;
    },
    retry: false,
  });



  const login = (accessToken : string , user : User) =>{
    Cookies.set(constant.ACCESS_TOKEN_KEY , accessToken , {
        expires : constant.ACCESS_TOKEN_EXPIRE,
    });
    setUser(user);
    queryClient.setQueryData(['auth', 'profile'], user);
  }


  const logout = async () =>{
    Cookies.remove(constant.ACCESS_TOKEN_KEY);
    setUser(null);
    queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
  };

  useEffect(() =>{
    if(data && !isLoading){
        setUser(data);
    }

    if(!data && !isLoading){
        setUser(null);
    }
  } , [data, isLoading]);


  return (
    <AuthContext.Provider
    value={{
        user , 
        setUser  ,
        isLoading ,
        login , 
        logout,
    }}
    >
        {children}
    </AuthContext.Provider>
  );
};

export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}