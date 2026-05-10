import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { Root } from "./Root";

const Login = lazy(() => import("./pages_2/Login"));
const Home = lazy(() => import("./pages_2/Home"));
const ExploreTrips = lazy(() => import("./pages_2/ExploreTrips"));
const Payment = lazy(() => import("./pages_2/PaymentConfirmation"));
const QueueStatus = lazy(() => import("./pages_2/QueueStatus"));
const History = lazy(() => import("./pages_2/BookingHistory"));
const Profile = lazy(() => import("./pages_2/Profile"));
const NotFound = lazy(() => import("./pages_2/NotFound"));

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
