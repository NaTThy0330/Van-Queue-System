import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { BottomNav } from "@/app/components/BottomNav";
import { useAppStore, BookingStatus } from "@/app/store";

const BookingHistory = () => {
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);
  const loadBookings = useAppStore((s) => s.loadBookings);
  const isBookingsLoading = useAppStore((s) => s.isBookingsLoading);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      await loadBookings(true);
    };

    refresh();
    const interval = setInterval(refresh, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loadBookings]);

  const activeBookings = bookings.filter(
    (b) => b.status === "waiting" || b.status === "unpaid" || b.status === "confirmed"
  );

  const historyBookings = bookings.filter(
    (b) => b.status === "expired" || b.status === "cancelled"
  );

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "waiting":
        return (
          <Badge className="bg-primary/20 text-primary border-0 text-xs">
            รอขึ้นรถ
          </Badge>
        );
      case "unpaid":
        return (
          <Badge
            variant="outline"
            className="border-accent-foreground text-accent-foreground text-xs"
          >
            รอชำระ
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-primary/20 text-primary border-0 text-xs">
            ยืนยันแล้ว
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="text-xs">
            หมดเวลา
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="text-xs">
            ยกเลิก
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const BookingCard = ({ booking }: { booking: (typeof bookings)[0] }) => (
    <Card
      className="p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] border-border/50"
      onClick={() => navigate(`/queue/${booking.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-primary">#{booking.queueNumber}</span>
            {getStatusBadge(booking.status)}
          </div>
          <p className="text-sm text-foreground">
            {booking.from} → {booking.to}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(booking.createdAt)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">ประวัติการจอง</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">
              คิวที่ใช้งาน ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              ประวัติ ({historyBookings.length})
            </TabsTrigger>
          </TabsList>

          {isBookingsLoading && (
            <div className="text-center text-sm text-muted-foreground pb-4">
              กำลังโหลดข้อมูลคิว...
            </div>
          )}

          <TabsContent value="active" className="space-y-3">
            {activeBookings.length === 0 ? (
              <EmptyState message="ไม่มีคิวที่กำลังใช้งาน" />
            ) : (
              activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {historyBookings.length === 0 ? (
              <EmptyState message="ไม่มีประวัติการจอง" />
            ) : (
              historyBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default BookingHistory;
