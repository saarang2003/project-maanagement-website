import api from "@/lib/axios";
import { Task } from "@/lib/types";
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
import DatePicker from "../ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";










interface TaskMutationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task_list_id: string;
  plan_id: string;
  task?: Task | null;
}

interface TaskInput {
  title: string;
  description: string;
  task_list_id: string;
  due_date: Date;
  priority: string;
  status: string;
}

const taskSchema = z.object({
  title: z.string( "Title is required" ).trim(),
  description: z.string( "Description is required" ).trim(),
  task_list_id: z.string( "Task list id is required" ),
  due_date: z.date( "Due date is required" ),
  priority: z.string( "Priority is required" ),
  status: z.string( "Status is required" ),
});


export function TaskMutationDialog({
  open,
  onOpenChange,
  task_list_id,
  plan_id,
  task,
}: TaskMutationDialogProps) {
  const [isMutationPending, setIsMutationPending] = useState(false);
  const queryclient = useQueryClient();
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title,
      description: task?.description,
      task_list_id: task_list_id,
      priority: task?.priority,
      due_date: new Date(task?.due_date!),
      status: task?.status,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskInput) =>
      api
        .patch(
          `/api/v1/plans/${plan_id}/task-lists/${task_list_id}/tasks/${task?._id}`,
          data
        )
        .then((res) => res),
    onSuccess: async () => {
      toast.success("Task updated successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskInput) =>
      api
        .post(`/api/v1/plans/${plan_id}/task-lists/${task_list_id}/tasks`, data)
        .then((res) => res),
    onSuccess: async () => {
      toast.success("New task added");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  function onSubmit(data: TaskInput) {
    if (!!task) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  useEffect(() => {
    form.setValue("title", task?.title || "");
    form.setValue("description", task?.description || "");
    form.setValue("status", task?.status || "");
    form.setValue("priority", task?.priority || "");
    form.setValue("due_date", new Date(task?.due_date!));
  }, [task]);

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
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for your board. Click save when you're done.
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
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <DatePicker
                      disabled={isMutationPending}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full"
                          disabled={isMutationPending}
                        >
                          <SelectValue placeholder="Select task priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="HIGH">HIGH</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="LOW">LOW</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full"
                          disabled={isMutationPending}
                        >
                          <SelectValue placeholder="Select task priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="OPEN">OPEN</SelectItem>
                        <SelectItem value="CLOSE">CLOSE</SelectItem>
                      </SelectContent>
                    </Select>
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