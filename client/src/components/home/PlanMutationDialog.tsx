import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useAuth } from "@/lib/auth";
import { Plan } from "@/lib/types";
import { useEffect, useState } from "react";

interface PlanInput {
  title: string;
  description: string;
  user_id: string;
}

interface PlanMutationDialogProps {
  plan?: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const planMutationSchema = z.object({
  title: z.string("Title is required").trim(),
  description: z.string("Description is required").trim(),
  user_id: z.string("User id is required"),
});

export function PlanMutationDialog({
  open,
  onOpenChange,
  plan,
}: PlanMutationDialogProps) {
  const [isMutationPending, setIsMutationPending] = useState(false);
  const auth = useAuth();
  const queryclient = useQueryClient();
  const form = useForm<PlanInput>({
    resolver: zodResolver(planMutationSchema),
    defaultValues: {
      title: plan?.title || "",
      description: plan?.description || "",
      user_id: auth.user?._id,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PlanInput) =>
      api.post("/api/v1/plans", data).then((res) => res),
    onSuccess: async () => {
      toast.success("New plan added");
      await queryclient.invalidateQueries({
        queryKey: ["plans", "include_all"],
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PlanInput) =>
      api.patch("/api/v1/plans", data).then((res) => res),
    onSuccess: async () => {
      toast.success("Plan updated successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", "include_all"],
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  function onSubmit(data: PlanInput) {
    if (!!plan) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  useEffect(() => {
    form.setValue("title", plan?.title || "");
    form.setValue("description", plan?.description || "");
  }, [plan]);

  useEffect(() => {
    setIsMutationPending(createMutation.isPending || updateMutation.isPending);

    return () => {
      form.reset();
    };
  }, [createMutation.isPending, updateMutation.isPending]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Plan</DialogTitle>
              <DialogDescription>
                Create a new plan for your board.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="title">Title</FormLabel>
                    <FormControl>
                      <Input
                        id="title"
                        disabled={isMutationPending}
                        placeholder="Learn Python"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        disabled={isMutationPending}
                        placeholder="Learn Python for AI/ML"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Plan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}