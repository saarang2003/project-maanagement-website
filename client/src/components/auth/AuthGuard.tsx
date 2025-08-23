
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../lib/auth";
import { Loader } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

// Protect from unauthorized access 


export default function AuthGuard({children} : AuthGuardProps){

    const location = useLocation();
    const {user , isLoading} = useAuth();

    if(isLoading){
        return(
            <div className="min-h-screen w-screen flex items-center justify-center">
                <Loader  className="animate-spin size-10 text-muted-foreground"/>
            </div>
        );
    }

    if(!user){
        return <Navigate to={"/login"} state={{from: location}} replace />
    }

    if(user){
        if(location.pathname === "/login" || location.pathname === "/register"){
            return <Navigate to={"/"} state={{from: location}} replace />
        }else{
            // protected routes
            return <>{children}</>
        }
    }
}