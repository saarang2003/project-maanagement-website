import { Link, useNavigate } from "react-router";
import z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";




interface RegisterInput {
    username : string;
    email : string;
    password : string;
}

const registerSchema = z.object({
  username: z.string("Username is required").trim(),
  email: z.string("Email is required" ).email().trim(),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(18, "Password should not exceed 18 characters")
    .trim(),
});

export function RegisterForm({
    className , 
    ...Props
} : React.ComponentPropsWithoutRef<"div">) {

    const navigate = useNavigate();
    
    const form = useForm<RegisterInput>({
        resolver : zodResolver(registerSchema),
        defaultValues : {
            username : "",
            email : "",
            password : "",
        }
    })

     const mutation = useMutation({
    mutationFn: (data: RegisterInput) =>
      api.post<User>("/api/v1/auth/register", data).then((res) => res.data),
    onSuccess: () => {
      navigate("/login");
      toast.success("Sign up successful");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });


    function onSubmit(data : RegisterInput){
    mutation.mutate(data);
    }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...Props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign up for Task-Tasks</CardTitle>
          <CardDescription>Create a free account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="username">Username</FormLabel>
                        <FormControl>
                          <Input
                            id="username"
                            disabled={mutation.isPending}
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            disabled={mutation.isPending}
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            disabled={mutation.isPending}
                            placeholder="*******"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                  >
                    Signup
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to={"/login"} className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
