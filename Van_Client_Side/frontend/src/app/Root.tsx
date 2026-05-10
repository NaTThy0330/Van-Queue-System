import { Suspense, useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "./store";
import { onDepartureAlert, syncDepartureTripSubscriptions, disconnectPassengerSocket } from "./lib/passengerSocket";
import { onDepartureAlert as onDriverDepartureAlert, disconnectDriverSocket, syncDriverTripSubscriptions } from "./lib/driverSocket";
import { AppLoadingScreen } from "./components/AppLoadingScreen";

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppStore((s: any) => s.isLoggedIn);
  const isAuthLoading = useAppStore((s: any) => s.isAuthLoading);
  const authReady = useAppStore((s: any) => s.authReady);
  const bootstrapAuth = useAppStore((s: any) => s.bootstrapAuth);
  const loadBookings = useAppStore((s: any) => s.loadBookings);
  const bookings = useAppStore((s: any) => s.bookings);

  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    if (authReady && isLoggedIn) {
      loadBookings(true);
    }
  }, [authReady, isLoggedIn, loadBookings]);

  useEffect(() => {
    const publicPaths = ["/"];
    if (authReady && !isAuthLoading && !isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/");
    }
  }, [authReady, isAuthLoading, isLoggedIn, location.pathname, navigate]);

  useEffect(() => {
    const handleAlert = (data: { title: string; message: string }) => {
      setNotification({ title: data.title, message: data.message });
      setTimeout(() => setNotification(null), 8000);
    };

    // Listen on BOTH passenger backend socket AND driver backend socket
    const unsubPassenger = onDepartureAlert(handleAlert);
    const unsubDriver = onDriverDepartureAlert(handleAlert);

    return () => {
      unsubPassenger();
      unsubDriver();
      disconnectPassengerSocket();
      disconnectDriverSocket();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      syncDepartureTripSubscriptions([]);
      syncDriverTripSubscriptions([]);
      return;
    }

    const tripIds = Array.from(
      new Set(
        bookings
          .filter((booking: any) => !["completed", "expired", "cancelled"].includes(booking.status))
          .map((booking: any) => booking.tripId)
          .filter(Boolean)
      )
    );

    syncDepartureTripSubscriptions(tripIds);
    syncDriverTripSubscriptions(tripIds);
  }, [bookings, isLoggedIn]);

  return (
    <div className="flex min-h-screen justify-center bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_36%),linear-gradient(180deg,#fff7f0_0%,#fff8f2_48%,#fffdf9_100%)]">
      <div className="relative min-h-screen w-full max-w-[430px] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="absolute -left-16 top-1/3 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-orange-200/20 blur-3xl" />
        </div>

        {notification && (
          <div
            style={{
              position: "fixed",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              width: "90%",
              maxWidth: 400,
              background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
              color: "white",
              borderRadius: 16,
              padding: "16px 20px",
              boxShadow: "0 8px 32px rgba(255, 107, 53, 0.4)",
              animation: "slideDown 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => setNotification(null)}
          >
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{notification.title}</div>
            <div style={{ fontSize: 14, opacity: 0.95 }}>{notification.message}</div>
          </div>
        )}
        <style>{`@keyframes slideDown { from { transform: translateX(-50%) translateY(-100%); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>

        <Suspense fallback={<AppLoadingScreen />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}
