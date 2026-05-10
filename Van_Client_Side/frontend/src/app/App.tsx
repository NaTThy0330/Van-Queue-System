import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppLoadingScreen } from "./components/AppLoadingScreen";

export default function App() {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
