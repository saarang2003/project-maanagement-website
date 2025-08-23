
import { LoginForm } from "@/components/auth/LoginForms";
import { useAuth } from "@/lib/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.isLoading && auth.user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from);
      return;
    }
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Task-Tasks
        </a>
        <LoginForm />
      </div>
    </div>
  );
}