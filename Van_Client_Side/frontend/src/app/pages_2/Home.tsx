import { useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeInfo,
  Bus,
  CalendarClock,
  ChevronRight,
  Clock3,
  MapPin,
  Megaphone,
  Navigation,
  Sparkles,
  Ticket,
  Wifi,
} from "lucide-react";
import { useAppStore } from "@/app/store";
import { BottomNav } from "@/app/components/BottomNav";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const routePins = [
  { name: "TU", label: "ต้นทาง", tone: "from-orange-500 to-amber-400" },
  { name: "BU", label: "จุดแวะ 2", tone: "from-orange-400 to-amber-300" },
  { name: "Central แจ้งวัฒนะ", label: "จุดแวะ 3", tone: "from-amber-400 to-orange-500" },
  { name: "หมอชิต", label: "ปลายทาง", tone: "from-slate-700 to-slate-900" },
];

const serviceHighlights = [
  {
    title: "มีรถรองรับตามทุกช่วงรอบเวลา",
    detail: "มีรอบวิ่งต่อเนื่องช่วงเช้าและเย็น",
    icon: Clock3,
  },
  {
    title: "จัดการเวลาได้ดีขึ้น",
    detail: "เช็กคิวล่วงหน้าและวางแผนออกเดินทางได้ง่าย",
    icon: Navigation,
  },
  {
    title: "ไม่จำเป็นต้องมาหน้างานเพื่อรอคิว",
    detail: "เชื่อมต่อได้ระหว่างเดินทาง",
    icon: Wifi,
  },
];

const newsItems = [
  {
    title: "ประกาศจากฝ่ายกิจการนักศึกษา",
    detail: "ช่วงสัปดาห์นี้มีการปรับรอบรถบางเที่ยวเพื่อรองรับกิจกรรมภายในมหาวิทยาลัย",
    tag: "TU",
  },
  {
    title: "แจ้งเตือนช่วงสอบกลางภาค",
    detail: "ขอให้นักศึกษาเผื่อเวลาเดินทางเพิ่ม และตรวจสอบรอบรถก่อนออกจากหอพัก",
    tag: "INFO",
  },
];

const stops = [
  "TU ธรรมศาสตร์รังสิต",
  "มหาลัยกรุงเทพ",
  "เซนทรัลเเจ้งวัฒนะ",
  "หมอชิต",
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [user?.name]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "สวัสดีตอนเช้า";
    if (hour < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_34%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] pb-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute left-[-5rem] top-1/3 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute bottom-24 right-1/4 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
      </div>

      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm text-slate-500">{greeting}</p>
            <h1 className="text-xl font-bold text-slate-900">{user?.name || "ผู้ใช้งาน"}</h1>
          </div>
          <motion.div
            whileHover={{ rotate: 4, scale: 1.02 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200"
          >
            {user?.name?.charAt(0) || "U"}
          </motion.div>
        </div>
      </div>

      <main className="mx-auto max-w-md px-4 pt-5">
        <motion.section
          data-reveal="hero"
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(249,115,22,0.98)_0%,rgba(251,146,60,0.92)_58%,rgba(253,186,116,0.95)_100%)] p-5 text-white shadow-[0_24px_70px_rgba(249,115,22,0.22)]"
        >
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] backdrop-blur">
            LIVE STATUS
          </div>

          <div className="relative grid gap-4 sm:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                <Sparkles size={12} />
                หน้าแรกสำหรับการเดินทางวันนี้
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold leading-tight">
                  สายรถตู้มหาวิทยาลัยธรรมศาสตร์
                  <br />
                  รังสิต
                </h2>
                <p className="max-w-[22rem] text-sm text-white/86">
                  ดูรอบรถที่ใกล้ถึง ตรวจความคืบหน้าแบบเรียลไทม์ และเช็กข่าวสารจากมหาวิทยาลัยก่อนออกเดินทาง
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-[11px] text-white/70">คิวถัดไป</p>
                  <p className="mt-1 text-sm font-semibold">TU ไปหมอชิต</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-[11px] text-white/70">ที่นั่งว่าง</p>
                  <p className="mt-1 text-sm font-semibold">6 ที่</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-[11px] text-white/70">รถวันนี้</p>
                  <p className="mt-1 text-sm font-semibold">TU - BKK</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative h-44 w-full max-w-[14rem] rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-[0_24px_50px_rgba(124,45,18,0.18)] backdrop-blur">
                <div className="absolute left-4 right-4 top-4 h-2 rounded-full bg-white/15" />
                <div className="absolute left-6 right-8 top-10 h-2 rounded-full bg-white/15" />
                <div className="absolute left-8 top-16 h-20 w-20 rounded-[1.4rem] bg-white/10" />
                <div className="absolute right-6 top-14 flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-white/12">
                  <Bus size={40} className="drop-shadow" />
                </div>
                <div className="absolute bottom-5 left-4 rounded-2xl bg-white/15 px-3 py-2 text-left">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">next van</p>
                  <p className="mt-1 text-sm font-semibold">08:35 - TU ไปหมอชิต</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section data-reveal="card" className="mt-4 grid grid-cols-3 gap-2">
          {serviceHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                whileHover={{ y: -3 }}
                className="rounded-[1.4rem] border border-white/70 bg-white/85 p-3 text-left shadow-[0_12px_28px_rgba(249,115,22,0.08)] backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Icon size={18} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{item.detail}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <motion.button
            data-reveal="action"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate("/explore")}
            className="group rounded-[1.75rem] border border-white/70 bg-white/90 p-4 text-left shadow-[0_14px_36px_rgba(249,115,22,0.10)] backdrop-blur-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-500">
              <Bus size={24} />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">จองที่นั่งออนไลน์</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  เลือกรอบรถ เช็กที่นั่ง และไปต่อได้ทันที
                </p>
              </div>
              <ArrowRight
                size={16}
                className="mt-1 text-orange-500 transition-transform group-hover:translate-x-1"
              />
            </div>
          </motion.button>

          <motion.button
            data-reveal="action"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -3 }}
            onClick={() => scrollToSection("news")}
            className="group rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,243,232,0.96))] p-4 text-left shadow-[0_14px_36px_rgba(249,115,22,0.10)] backdrop-blur-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 text-orange-500">
              <Megaphone size={24} />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">ข่าวสารออนไลน์</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  ดูประกาศ โปรโมชั่น และอัปเดตการเดินทาง
                </p>
              </div>
              <ChevronRight
                size={16}
                className="mt-1 text-orange-500 transition-transform group-hover:translate-x-1"
              />
            </div>
          </motion.button>
        </section>

        <motion.section
          data-reveal="card"
          className="mt-4 overflow-hidden rounded-[1.8rem] border border-orange-100 bg-white/88 p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-orange-500">today route</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">แผนที่จำลองของรถวันนี้</h3>
              <p className="mt-1 text-sm text-slate-500">
                เห็นเส้นทาง จุดแวะ และตำแหน่งรถแบบภาพรวม ให้หน้าแรกดูเหมือนแอปรถตู้ที่ใช้งานจริง
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
              <MapPin size={18} />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,249,243,1)_0%,rgba(255,255,255,1)_100%)] p-4">
            <div className="relative h-56 overflow-hidden rounded-[1.4rem] border border-dashed border-orange-100 bg-[linear-gradient(rgba(249,115,22,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.06)_1px,transparent_1px)] bg-[size:26px_26px]">
              <div className="absolute left-[12%] top-[50%] h-1 w-[66%] rounded-full bg-gradient-to-r from-orange-200 via-orange-400 to-amber-300" />
              <div className="absolute left-[12%] top-[32%] h-1 w-[46%] rounded-full bg-orange-200/90" />
              <div className="absolute left-[12%] top-[68%] h-1 w-[22%] rounded-full bg-orange-200/90" />

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute left-[56%] top-[44%] flex items-center gap-2 rounded-[1.3rem] border border-white/70 bg-white px-3 py-2 shadow-[0_14px_24px_rgba(249,115,22,0.15)]"
              >
                <Bus size={16} className="text-orange-500" />
                <span className="text-xs font-semibold text-slate-800">รถกำลังมา</span>
              </motion.div>

              <div className="absolute left-[11.4%] top-[46%] flex h-6 w-6 items-center justify-center rounded-full border border-white bg-orange-500 text-[10px] font-bold text-white shadow-lg shadow-orange-200">
                1
              </div>
              <div className="absolute left-[34%] top-[30%] flex h-6 w-6 items-center justify-center rounded-full border border-white bg-amber-400 text-[10px] font-bold text-white shadow-lg shadow-amber-200">
                2
              </div>
              <div className="absolute left-[58%] top-[64%] flex h-6 w-6 items-center justify-center rounded-full border border-white bg-orange-300 text-[10px] font-bold text-white shadow-lg shadow-orange-200">
                3
              </div>
              <div className="absolute left-[83%] top-[44%] flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-800 text-[10px] font-bold text-white shadow-lg shadow-slate-200">
                4
              </div>

              {routePins.map((pin, index) => (
                <div
                  key={pin.name}
                  className={`absolute ${
                    index === 0
                      ? "left-[8%] top-[14%]"
                      : index === 1
                        ? "left-[34%] top-[74%]"
                        : index === 2
                          ? "left-[55%] top-[16%]"
                          : "left-[78%] top-[14%]"
                  }`}
                >
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${pin.tone} shadow-lg`} />
                  <div className="mt-2 rounded-2xl border border-white/80 bg-white/90 px-2 py-1 shadow-sm">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-orange-500">{pin.name}</p>
                    <p className="text-[11px] font-semibold text-slate-800">{pin.label}</p>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-4 rounded-[1.3rem] border border-white/75 bg-white/90 px-3 py-2 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">ETA</p>
                <p className="text-sm font-bold text-slate-900">ถึงใน 14 นาที</p>
              </div>
              <div className="absolute bottom-4 right-4 rounded-[1.3rem] border border-white/75 bg-white/90 px-3 py-2 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">queue</p>
                <p className="text-sm font-bold text-slate-900">จองเต็ม 78%</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {stops.map((stop, index) => (
                <div
                  key={stop}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_8px_24px_rgba(249,115,22,0.06)]"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                      index === 0
                        ? "bg-orange-50 text-orange-500"
                        : index === stops.length - 1
                          ? "bg-slate-900 text-white"
                          : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      จุดแวะ {index + 1}
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">{stop}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <motion.article
            data-reveal="card"
            className="rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,245,236,0.96))] p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-orange-500">ads</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">พื้นที่โฆษณา</h3>
              </div>
              <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
                <Ticket size={18} />
              </div>
            </div>
            <div className="mt-4 rounded-[1.4rem] bg-[linear-gradient(135deg,#ffedd5_0%,#fed7aa_45%,#fb923c_100%)] p-4 text-white shadow-[0_18px_40px_rgba(249,115,22,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/75">ads partner</p>
              <h4 className="mt-2 text-xl font-bold leading-tight">สื่อประชาสัมพันธ์จากพาร์ตเนอร์</h4>
              <p className="mt-2 max-w-[18rem] text-sm text-white/88">
                พื้นที่ตัวอย่างสำหรับแบรนด์ที่ต้องการลงโฆษณาในแอป เช่น โปรโมชัน เครื่องดื่ม และบริการใกล้มหาวิทยาลัย
              </p>
            </div>
          </motion.article>

          <motion.article
            data-reveal="card"
            className="rounded-[1.8rem] border border-white/70 bg-white/88 p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-orange-500">news</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">ข่าวสารล่าสุด</h3>
              </div>
              <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
                <BadgeInfo size={18} />
              </div>
            </div>

            <div id="news" className="mt-4 space-y-3">
              {newsItems.map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-orange-100 bg-orange-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-white">
                      {item.tag}
                    </span>
                    <CalendarClock size={14} className="text-orange-500" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </section>

        <motion.section
          data-reveal="card"
          className="mt-4 overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/88 p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-orange-500">hot spots</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">จุดขึ้นรถยอดนิยม</h3>
            </div>
            <ArrowRight size={18} className="text-orange-500" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "TU ธรรมศาสตร์รังสิต",
              "โรงพยาบาลรังสิต",
              "มหาลัยกรุงเทพ",
              "หมอชิต",
              "ฟิวเจอร์ปาร์ครังสิต",
              "อนุสาวรีย์ชัย",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
