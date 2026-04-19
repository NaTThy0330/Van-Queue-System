import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
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

const ExploreTrips = () => {
  const navigate = useNavigate();
  const trips = useAppStore((s) => s.trips);
  const user = useAppStore((s) => s.user);
  const isTripsLoading = useAppStore((s) => s.isTripsLoading);
  const loadTrips = useAppStore((s) => s.loadTrips);
  const addBooking = useAppStore((s) => s.addBooking);

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

  const locations = Array.from(
    new Set(
      trips
        .flatMap((trip) => [trip.from, trip.to])
        .filter((item) => item && item !== "ไม่ระบุ")
    )
  );

  const filteredTrips = trips
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
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">จองคิวรถตู้</h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="ต้นทาง" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">ทุกต้นทาง</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="ปลายทาง" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">ทุกปลายทาง</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === "eta" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("eta")}
              className="flex-1"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              รถถึงเร็วที่สุด
            </Button>
            <Button
              variant={sortBy === "queue" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("queue")}
              className="flex-1"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              คิวน้อยที่สุด
            </Button>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {error && <div className="text-sm text-destructive text-center">{error}</div>}
        {isTripsLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            กำลังโหลดเที่ยวรถ...
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            ไม่พบเที่ยวรถที่ตรงกับเงื่อนไข
          </div>
        ) : (
          filteredTrips.map((trip, index) => (
            <TripCard key={trip.id} trip={trip} onBook={handleBook} index={index} />
          ))
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
