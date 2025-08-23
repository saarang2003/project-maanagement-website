import api from "@/lib/axios";
import { TaskList } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";





interface TaskListMutationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan_id: string;
  taskList?: TaskList | null;
}


interface TaskListInput {
  title: string;
  description: string;
  plan_id: string;
}

const taskListSchema = z.object({
  title: z.string("Title is required").trim(),
  description: z.string("Description is required").trim(),
  plan_id: z.string("Plan id is required"),
});



export function TaskListMutationDialog({
  open,
  onOpenChange,
  plan_id,
  taskList,
}: TaskListMutationDialogProps) {
  const [isMutationPending, setIsMutationPending] = useState(false);
  const queryclient = useQueryClient();
  const form = useForm<TaskListInput>({
    resolver: zodResolver(taskListSchema),
    defaultValues: {
      title: taskList?.title || "",
      description: taskList?.description || "",
      plan_id: plan_id,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskListInput) =>
      api.post(`/api/v1/plans/${plan_id}/task-lists`, data).then((res) => res),
    onSuccess: async () => {
      toast.success("New task list added");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskListInput) =>
      api
        .patch(`/api/v1/plans/${plan_id}/task-lists/${taskList?._id}`, data)
        .then((res) => res),
    onSuccess: async () => {
      toast.success("Task list updated successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  function onSubmit(data: TaskListInput) {
    if (!!taskList) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }
  useEffect(() => {
    form.setValue("title", taskList?.title || "");
    form.setValue("description", taskList?.description || "");
  }, [taskList]);

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
              <DialogTitle>Add New Task List</DialogTitle>
              <DialogDescription>
                Create a new task list for your board. Click save when you're
                done.
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
              <Button type="submit" disabled={isMutationPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}