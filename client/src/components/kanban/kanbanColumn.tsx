import api from "@/lib/axios";
import { Task, TaskList } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit3, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanTaskItem } from "./KanbanTaskItem";
import { TaskMutationDialog } from "./TaskMutationDialog";








interface KanbanColumnProps {
  taskList: TaskList;
  tasks: Task[];
  plan_id: string;
  handleEditTaskList: (task: TaskList) => void;
  handleTaskListDelete: (taskListId: string) => void;
}

export function KanbanColumn({
  taskList,
  plan_id,
  tasks,
  handleEditTaskList,
  handleTaskListDelete,
}: KanbanColumnProps) {
  const queryclient = useQueryClient();
  // Column = Task List
  const { setNodeRef, isOver } = useDroppable({
    id: taskList._id,
  });
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const taskIds = useMemo(
    () => tasks.map((task) => task._id),
    [taskList, taskList.tasks]
  );

  const handleTaskEdit = (task: Task) => {
    setEditTask(task);
    setOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) =>
      api
        .delete(
          `/api/v1/plans/${plan_id}/task-lists/${taskList._id}/tasks/${taskId}`
        )
        .then((res) => res),
    onSuccess: async () => {
      toast.success("Task deleted successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  function handleTaskDelete(taskId: string) {
    deleteMutation.mutate(taskId);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        className={cn(
          "flex h-full w-72 shrink-0 flex-col rounded-lg bg-gray-100/80 p-2",
          isOver && "ring-2 ring-blue-500/50"
        )}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-x-3">
            <h3 className="font-medium">{taskList.title}</h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs">
              {taskList.tasks.length}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditTaskList(taskList)}>
                <Edit3 className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTaskListDelete(taskList._id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks?.map((task) => (
              <KanbanTaskItem
                key={task._id}
                task={task}
                handleTaskEdit={handleTaskEdit}
                handleTaskDelete={handleTaskDelete}
              />
            ))}
          </SortableContext>
        </div>
      </div>
      <TaskMutationDialog
        task_list_id={taskList._id}
        plan_id={plan_id}
        onOpenChange={setOpen}
        open={open}
        task={editTask}
      />
    </>
  );
}