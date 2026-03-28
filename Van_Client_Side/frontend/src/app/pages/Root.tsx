import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import AOS from "aos";
import { useAppStore } from "../store";

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);
  const authReady = useAppStore((s) => s.authReady);
  const bootstrapAuth = useAppStore((s) => s.bootstrapAuth);

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

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center">
      <div className="w-full max-w-[430px] relative min-h-screen bg-orange-50 overflow-hidden">
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
