import { PlanCard } from "@/components/home/PlanCard";
import { PlanMutationDialog } from "@/components/home/PlanMutationDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axios";
import { Plan } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const queryclient = useQueryClient();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const { isLoading, data: plans } = useQuery<Plan[]>({
    queryKey: ["plans", "include_all"],
    queryFn: async () => {
      const res = await api.get("/api/v1/plans?include_all=true");
      return res?.data?.data;
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: string) =>
      api.delete(`/api/v1/plans/${planId}`).then((res) => res),
    onSuccess: async () => {
      toast.success("Plan deleted successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", "include_all"],
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  const handlePlanEdit = (plan: Plan) => {
    setEditPlan(plan);
    setOpen(true);
  };

  const handlePlanDelete = (planId: string) => {
    deleteMutation.mutate(planId);
  };

  return (
    <>
      <div className="container mx-auto py-10">
        <div className="mb-5">
          <div>
            <h1 className="text-3xl font-bold">
              Hello, {auth.user?.username} 👋
            </h1>
            <p className="text-muted-foreground">Welcome from Task-Tasks</p>
          </div>
        </div>
        <div className="space-y-4 mt-5">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-semibold">Your Plans</h2>
            <Button
              onClick={() => {
                setOpen(true);
              }}
            >
              <PlusCircle /> Create New Plan
            </Button>
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : plans && plans?.length > 0 ? (
            <div className="grid grid-cols-4 gap-6">
              {plans?.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  handlePlanEdit={handlePlanEdit}
                  handlePlanDelete={handlePlanDelete}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No plan create yet!
            </p>
          )}
        </div>
      </div>
      <PlanMutationDialog open={open} onOpenChange={setOpen} plan={editPlan} />
    </>
  );
}