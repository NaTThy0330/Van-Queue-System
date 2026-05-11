import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowUpDown, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { TripCard } from "@/app/components/TripCard";
import { PaymentModal } from "@/app/components/PaymentModal";
import { useAppStore, Trip } from "@/app/store";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const ExploreTrips = () => {
  const navigate = useNavigate();
  const trips = useAppStore((s) => s.trips);
  const user = useAppStore((s) => s.user);
  const isTripsLoading = useAppStore((s) => s.isTripsLoading);
  const loadTrips = useAppStore((s) => s.loadTrips);
  const addBooking = useAppStore((s) => s.addBooking);

  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [trips.length]);

  const [origin, setOrigin] = useState<string>("all");
  const [destination, setDestination] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"eta" | "queue">("eta");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      await loadTrips();
    };

    refresh();
    const interval = setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loadTrips]);

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          trips
            .flatMap((trip) => [trip.from, trip.to])
            .filter((item) => item && item !== "ไม่ระบุ")
        )
      ),
    [trips]
  );

  const filteredTrips = trips
    .filter((trip) => {
      // Hide trips whose departure time has already passed (client-side fallback)
      if (trip.isSpecialRound) return true;
      if (!trip.departureTime || trip.departureTime === "-") return false;
      const match = trip.departureTime.match(/(\d{1,2}):(\d{2})/);
      if (!match) return true;
      const [, h, m] = match.map(Number);
      const now = new Date();
      const depTime = new Date();
      depTime.setHours(h, m, 0, 0);
      return depTime > now;
    })
    .filter((trip) => origin === "all" || trip.from === origin)
    .filter((trip) => destination === "all" || trip.to === destination)
    .sort((a, b) => {
      if (sortBy === "eta") return a.eta - b.eta;
      return a.queueCount - b.queueCount;
    });

  const handleBook = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowPaymentModal(true);
  };

  const handleCreateBooking = async (isPaid: boolean) => {
    if (isSubmitting) return;
    if (!selectedTrip || !user) {
      setError("กรุณาลงชื่อเข้าใช้");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const booking = await addBooking(selectedTrip.id, isPaid);
      setShowPaymentModal(false);
      if (isPaid) {
        navigate(`/payment/${booking.id}`);
      } else {
        navigate(`/queue/${booking.id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] pb-28"
    >
      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-2xl bg-white/90 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-orange-500">ค้นหาเที่ยวรถ</p>
              <h1 className="text-lg font-bold text-slate-900">เลือกเที่ยวที่เหมาะกับคุณ</h1>
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(249,115,22,0.98)_0%,rgba(251,146,60,0.92)_100%)] p-4 text-white shadow-[0_16px_40px_rgba(249,115,22,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                  <Sparkles size={12} />
                  อัปเดตเที่ยวรถแบบเรียลไทม์
                </div>
                <p className="mt-3 text-sm text-white/90">
                  เลือกต้นทาง ปลายทาง และจัดเรียงให้ตรงกับจังหวะการเดินทางของคุณ
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">🚌</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger className="h-12 rounded-2xl border-white/70 bg-white/90 shadow-sm">
                <SelectValue placeholder="ต้นทาง" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-orange-100 bg-white">
                <SelectItem value="all">ทุกต้นทาง</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="h-12 rounded-2xl border-white/70 bg-white/90 shadow-sm">
                <SelectValue placeholder="ปลายทาง" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-orange-100 bg-white">
                <SelectItem value="all">ทุกปลายทาง</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant={sortBy === "eta" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("eta")}
              className="flex-1 rounded-2xl"
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              เร็วสุด
            </Button>
            <Button
              variant={sortBy === "queue" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("queue")}
              className="flex-1 rounded-2xl"
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              คิวน้อยสุด
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-4">
        {error && (
          <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isTripsLoading ? (
          <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
            <p className="text-sm text-slate-500">กำลังโหลดเที่ยวรถ...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-50 text-2xl">
              🪄
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยังไม่พบเที่ยวรถ</h3>
            <p className="mt-1 text-sm text-slate-500">
              ลองเปลี่ยนตัวกรองต้นทางหรือปลายทางดูอีกครั้ง
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} onBook={handleBook} index={index} />
            ))}
          </div>
        )}
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        trip={selectedTrip}
        onPayNow={() => handleCreateBooking(true)}
        onPayLater={() => handleCreateBooking(false)}
      />
    </div>
  );
};

export default ExploreTrips;
