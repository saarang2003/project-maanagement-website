import AuthGuard from "@/components/auth/AuthGuard";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import TaskLists from "@/pages/TaskLists";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <Home />
      </AuthGuard>
    ),
  },
  {
    path: "/:plan_id/task-lists",
    element: (
      <AuthGuard>
        <TaskLists />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <Register />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;