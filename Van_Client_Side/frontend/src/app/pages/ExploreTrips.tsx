import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore, Trip } from "../store";
import { TripCard } from "../components/TripCard";
import { PaymentModal } from "../components/PaymentModal";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

const LOCATIONS = [
  "ทั้งหมด",
  "ธรรมศาสตร์ รังสิต",
  "ฟิวเจอร์พาร์ค",
  "หมอชิต",
  "อนุสาวรีย์",
];

type SortType = "eta" | "queue";

export function ExploreTrips() {
  const navigate = useNavigate();
  const trips = useAppStore((s) => s.trips);
  const addBooking = useAppStore((s) => s.addBooking);

  const [filterFrom, setFilterFrom] = useState("ทั้งหมด");
  const [filterTo, setFilterTo] = useState("ทั้งหมด");
  const [sort, setSort] = useState<SortType>("eta");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = trips
    .filter((t) => {
      const matchFrom = filterFrom === "ทั้งหมด" || t.from === filterFrom;
      const matchTo = filterTo === "ทั้งหมด" || t.to === filterTo;
      const matchSearch =
        !search || t.from.includes(search) || t.to.includes(search);
      return matchFrom && matchTo && matchSearch;
    })
    .sort((a, b) =>
      sort === "eta" ? a.eta - b.eta : a.queueCount - b.queueCount
    );

  const handleBook = (trip: Trip) => {
    setSelectedTrip(trip);
    setModalOpen(true);
  };

  const handlePayNow = () => {
    if (!selectedTrip) return;
    const booking = addBooking(selectedTrip.id, false);
    setModalOpen(false);
    navigate(`/payment/${booking.id}`);
  };

  const handlePayLater = () => {
    if (!selectedTrip) return;
    const booking = addBooking(selectedTrip.id, false);
    setModalOpen(false);
    navigate(`/queue/${booking.id}`);
  };

  const hasActiveFilters =
    filterFrom !== "ทั้งหมด" || filterTo !== "ทั้งหมด" || search !== "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-4 pt-12 pb-6 relative overflow-hidden">
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="flex items-center gap-3 mb-4 relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="bg-white/20 rounded-xl p-2"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          <h2 className="text-white flex-1">ค้นหาเที่ยวรถ</h2>
        </div>

        {/* Search */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเส้นทาง..."
            className="w-full bg-white/20 placeholder:text-orange-200 text-white rounded-2xl py-3 pl-9 pr-10 outline-none text-sm"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-white/70" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="px-4 py-3 bg-white shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: hasActiveFilters ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <SlidersHorizontal size={14} className="text-orange-400" />
          </motion.div>
          <span className="text-xs text-gray-500">กรองและเรียง</span>
          {hasActiveFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full"
            >
              มีตัวกรอง
            </motion.span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <LocationSelect
            value={filterFrom}
            onChange={setFilterFrom}
            label="ต้นทาง"
          />
          <LocationSelect
            value={filterTo}
            onChange={setFilterTo}
            label="ปลายทาง"
          />

          <div className="flex gap-2">
            {(["eta", "queue"] as const).map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  sort === s
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {s === "eta" ? "⚡ เร็วที่สุด" : "👥 คิวน้อย"}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="px-4 py-4">
        <motion.p
          key={filtered.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-400 mb-3"
        >
          พบ {filtered.length} เที่ยวรถ
        </motion.p>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center py-16"
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                🚌
              </motion.div>
              <p className="text-gray-400">ไม่พบเที่ยวรถที่ตรงกับเงื่อนไข</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} onBook={handleBook} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trip={selectedTrip}
        onPayNow={handlePayNow}
        onPayLater={handlePayLater}
      />
    </div>
  );
}

// Select component
function LocationSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs outline-none transition-colors ${
          value !== "ทั้งหมด"
            ? "bg-orange-50 border-orange-300 text-orange-700"
            : "bg-white border-gray-200 text-gray-600"
        }`}
      >
        <span>
          {label}: {value === "ทั้งหมด" ? "ทั้งหมด" : value.split(" ")[0]}
        </span>
        <Select.Icon>
          <ChevronDown size={12} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden z-50 w-56">
          <Select.Viewport className="p-2">
            {LOCATIONS.map((loc) => (
              <Select.Item
                key={loc}
                value={loc}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-700 cursor-pointer outline-none data-[highlighted]:bg-orange-50"
              >
                <Select.ItemText>{loc}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={14} className="text-orange-500" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
