import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import Login from "./pages_2/Login";
import Home from "./pages_2/Home";
import ExploreTrips from "./pages_2/ExploreTrips";
import Payment from "./pages_2/PaymentConfirmation";
import QueueStatus from "./pages_2/QueueStatus";
import History from "./pages_2/BookingHistory";
import Profile from "./pages_2/Profile";
import NotFound from "./pages_2/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "home", Component: Home },
      { path: "explore", Component: ExploreTrips },
      { path: "payment/:id", Component: Payment },
      { path: "queue/:id", Component: QueueStatus },
      { path: "history", Component: History },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);
