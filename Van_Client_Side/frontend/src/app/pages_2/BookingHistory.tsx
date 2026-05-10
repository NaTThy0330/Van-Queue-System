import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronRight, History, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { BottomNav } from "@/app/components/BottomNav";
import { useAppStore, BookingStatus } from "@/app/store";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const BookingHistory = () => {
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);
  const loadBookings = useAppStore((s) => s.loadBookings);
  const isBookingsLoading = useAppStore((s) => s.isBookingsLoading);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [bookings.length]);

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

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status === "waiting" || b.status === "unpaid" || b.status === "confirmed"),
    [bookings]
  );

  const historyBookings = useMemo(
    () => bookings.filter((b) => b.status === "completed" || b.status === "expired" || b.status === "cancelled"),
    [bookings]
  );

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "waiting":
        return <Badge className="border-0 bg-orange-100 px-2.5 py-1 text-xs text-orange-700">รอรถ</Badge>;
      case "unpaid":
        return <Badge variant="outline" className="border-orange-200 px-2.5 py-1 text-xs text-orange-700">รอชำระ</Badge>;
      case "confirmed":
        return <Badge className="border-0 bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">ยืนยันแล้ว</Badge>;
      case "completed":
        return <Badge className="border-0 bg-slate-200 px-2.5 py-1 text-xs text-slate-700">จบงานแล้ว</Badge>;
      case "expired":
        return <Badge variant="secondary" className="px-2.5 py-1 text-xs">หมดเวลา</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="px-2.5 py-1 text-xs">ยกเลิก</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const BookingCard = ({ booking }: { booking: (typeof bookings)[0] }) => (
    <Card
      className="rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
      onClick={() => navigate(`/queue/${booking.id}`)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-orange-600">#{booking.queueNumber}</span>
            {getStatusBadge(booking.status)}
          </div>
          <p className="truncate text-sm font-medium text-slate-900">
            {booking.from} → {booking.to}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(booking.createdAt)}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-white/75 p-8 text-center text-slate-500 backdrop-blur-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-50 text-2xl">
        <Sparkles size={20} />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] pb-28"
    >
      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")} className="rounded-2xl bg-white/90 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-500">ประวัติการจอง</p>
            <h1 className="text-lg font-bold text-slate-900">ดูคิวและสถานะย้อนหลัง</h1>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
            <History size={18} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-[1.4rem] bg-white/85 p-1 shadow-[0_12px_34px_rgba(249,115,22,0.08)]">
            <TabsTrigger value="active" className="rounded-[1rem] data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              คิวใช้งาน ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-[1rem] data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              ประวัติ ({historyBookings.length})
            </TabsTrigger>
          </TabsList>

          {isBookingsLoading && (
            <div className="py-4 text-center text-sm text-slate-500">กำลังโหลดข้อมูลคิว...</div>
          )}

          <TabsContent value="active" className="mt-4 space-y-3">
            {activeBookings.length === 0 ? (
              <EmptyState message="ยังไม่มีคิวที่กำลังใช้งาน" />
            ) : (
              activeBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            {historyBookings.length === 0 ? (
              <EmptyState message="ยังไม่มีประวัติการจอง" />
            ) : (
              historyBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default BookingHistory;
