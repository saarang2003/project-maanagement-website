import { Task } from "@/lib/types";
import { useSortable} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanTask } from "./KanbanTask";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";





interface KanbanTaskItemProps {
  task: Task;
  handleTaskEdit: (task: Task) => void;
  handleTaskDelete: (taskId: string) => void;
}

export function KanbanTaskItem({
  task,
  handleTaskEdit,
  handleTaskDelete,
}: KanbanTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative mb-2 touch-none group"
      >
        <KanbanTask task={task} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleTaskEdit(task)}>
              <Edit3 className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTaskDelete(task._id)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}