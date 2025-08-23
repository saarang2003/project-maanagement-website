import { Edit3, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plan } from "@/lib/types";
import { useNavigate } from "react-router";

interface PlanCardProps {
  plan: Plan;
  handlePlanEdit: (plan: Plan) => void;
  handlePlanDelete: (planId: string) => void;
}

export function PlanCard({
  plan,
  handlePlanEdit,
  handlePlanDelete,
}: PlanCardProps) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{plan.title}</CardTitle>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/${plan._id}/task-lists`)}
                >
                  <Eye className="h-4 w-4" />
                  View Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlanEdit(plan)}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlanDelete(plan._id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="text-xs">
          {plan.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}