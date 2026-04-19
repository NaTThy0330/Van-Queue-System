import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import AOS from "aos";
import { useAppStore } from "../store";
import { onDepartureAlert, disconnectDriverSocket } from "../lib/driverSocket";

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppStore((s: any) => s.isLoggedIn);
  const isAuthLoading = useAppStore((s: any) => s.isAuthLoading);
  const authReady = useAppStore((s: any) => s.authReady);
  const bootstrapAuth = useAppStore((s: any) => s.bootstrapAuth);

  // Notification state
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  // Init AOS once
  useEffect(() => {
    AOS.init({
      duration: 480,
      once: false,
      easing: "ease-out-cubic",
      offset: 20,
      delay: 0,
    });
  }, []);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  // Auth guard + refresh AOS on nav
  useEffect(() => {
    const publicPaths = ["/"];
    if (authReady && !isAuthLoading && !isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/");
    }
    // Give React a tick to finish rendering before refreshing AOS
    const t = setTimeout(() => AOS.refresh(), 120);
    return () => clearTimeout(t);
  }, [authReady, isAuthLoading, isLoggedIn, location.pathname, navigate]);

  // Listen for departure notifications from driver
  useEffect(() => {
    const unsub = onDepartureAlert((data) => {
      setNotification({ title: data.title, message: data.message });
      // Auto-dismiss after 8 seconds
      setTimeout(() => setNotification(null), 8000);
    });
    return () => {
      unsub();
      disconnectDriverSocket();
    };
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center">
      <div className="w-full max-w-[430px] relative min-h-screen bg-orange-50 overflow-hidden">
        {/* Departure Notification Toast */}
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
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              {notification.title}
            </div>
            <div style={{ fontSize: 14, opacity: 0.95 }}>
              {notification.message}
            </div>
          </div>
        )}
        <style>{`@keyframes slideDown { from { transform: translateX(-50%) translateY(-100%); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
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
      </div>
    </div>
  );
}
