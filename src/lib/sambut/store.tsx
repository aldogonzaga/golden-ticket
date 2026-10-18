import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type Category = "SMP" | "Guru" | "VIP" | "Orang Tua/Wali";
export type Rsvp = "Pending" | "Hadir" | "Tidak Hadir";
export type Member = { id: string; name: string; role: string; present: boolean };
export type Invitation = {
  id: string;
  code: string;
  name: string;
  category: Category;
  institution: string;
  principal: string;
  pic: string;
  phone: string;
  quota: number;
  seat: string;
  rsvp: Rsvp;
  checked: number;
  members: Member[];
  mou: string;
  note: string;
  student: string;
  title: string;
  relationship: string;
  vipLevel: string;
  cancelled: boolean;
  mouDate: string;
  signer: string;
};
export type Settings = {
  name: string;
  school: string;
  date: string;
  location: string;
  tagline: string;
  contact: string;
  groupPhoto: string;
};
export type Activity = { text: string; time: string };
export type Message = { name: string; text: string; category: string };
type Data = {
  invitations: Invitation[];
  settings: Settings;
  activities: Activity[];
  messages: Message[];
};
export const categories: Category[] = ["SMP", "Guru", "VIP", "Orang Tua/Wali"];
export const mouStatuses = [
  "Belum dijadwalkan",
  "Menunggu tanda tangan",
  "Sudah ditandatangani",
  "Perlu tindak lanjut",
];
export function blankInvitation(): Invitation {
  return {
    id: "",
    code: "",
    name: "",
    category: "SMP",
    institution: "",
    principal: "",
    pic: "",
    phone: "",
    quota: 10,
    seat: "",
    rsvp: "Pending",
    checked: 0,
    members: [],
    mou: mouStatuses[0] ?? "Belum dijadwalkan",
    note: "",
    student: "",
    title: "",
    relationship: "Ayah",
    vipLevel: "VIP",
    cancelled: false,
    mouDate: "",
    signer: "",
  };
}
function seed(): Data {
  const schools = [
    "SMP Negeri 1 Cibitung",
    "SMP Negeri 2 Cibitung",
    "SMP Negeri 3 Tambun Selatan",
    "SMP Islam Al Azhar 9",
    "SMP Negeri 1 Cikarang Barat",
  ];
  const principals = [
    "Drs. Budi Santoso, M.Pd.",
    "Dra. Siti Rahmawati, M.Pd.",
    "Drs. Ahmad Hidayat",
    "Dra. Ratna Wulandari",
    "Drs. Dedi Supriyadi",
  ];
  const names = [
    "Aditya Pratama",
    "Nabila Putri",
    "Rizky Ramadhan",
    "Salsabila Zahra",
    "Fajar Maulana",
    "Putri Aulia",
    "Dimas Saputra",
    "Ani Wulandari",
    "Dewi Lestari",
    "Agus Setiawan",
  ];
  const invitations: Invitation[] = schools.map((name, i) => ({
    ...blankInvitation(),
    id: `school-${i}`,
    code: `GCP-SMP-${["A7K2X", "B8M3Y", "C9N4Z", "D2P5W", "E3Q6V"][i]}`,
    name,
    principal: principals[i] ?? "Kepala Sekolah",
    pic:
      ["Ani Wulandari", "Dewi Lestari", "Agus Setiawan", "Rina Handayani", "Hendra Gunawan"][i] ??
      "",
    phone: `08123456780${i}`,
    quota: 10,
    seat: `A-${String(i + 1).padStart(2, "0")}`,
    rsvp: i === 3 ? "Pending" : i === 4 ? "Tidak Hadir" : "Hadir",
    checked: i === 0 ? 4 : i === 1 ? 2 : 0,
    mou: mouStatuses[i % 4] ?? "Belum dijadwalkan",
    members: names.slice(0, i === 0 ? 10 : i === 1 ? 8 : 6).map((n, j) => ({
      id: `s${i}-m${j}`,
      name: n,
      role: j < 6 ? "Siswa" : "Guru/Pendamping",
      present: j < (i === 0 ? 4 : i === 1 ? 2 : 0),
    })),
  }));
  const extra: [string, Category, string, number][] = [
    ["Maam Honey", "Guru", "SMK Metland", 1],
    ["Dra. Rina Handayani", "Guru", "SMP Negeri 4 Tambun", 2],
    ["Bapak Hendra Wijaya", "VIP", "Dinas Pendidikan Kab. Bekasi", 2],
    ["Ibu Sri Wahyuni", "VIP", "Yayasan Pendidikan Metland", 1],
    ["Bapak Andi Prasetyo", "Orang Tua/Wali", "Mahes 2027 · XI PPLG 1", 2],
    ["Ibu Dewi Anggraini", "Orang Tua/Wali", "Mahes 2027 · XI DKV", 2],
    ["Bapak Agus Susanto", "Orang Tua/Wali", "Mahes 2027 · XI AKL", 2],
  ];
  extra.forEach(([name, category, institution, quota], i) =>
    invitations.push({
      ...blankInvitation(),
      id: `guest-${i}`,
      code: `GCP-${category === "Guru" ? "GR" : category === "VIP" ? "VIP" : "ORT"}-${["H7R2A", "J8S3B", "K9T4C", "L2U5D", "M3V6E", "N4W7F", "P5X8G"][i]}`,
      name,
      category,
      institution,
      quota,
      seat: `${category === "VIP" ? "VIP" : "B"}-${String(i + 1).padStart(2, "0")}`,
      rsvp: i === 6 ? "Pending" : "Hadir",
      checked: i === 0 ? 1 : 0,
      student:
        category === "Orang Tua/Wali"
          ? (["", "", "", "", "Muhammad Farhan", "Alya Safitri", "Kevin Pratama"][i] ?? "")
          : "",
      phone: `08129876540${i}`,
    }),
  );
  return {
    invitations,
    settings: {
      name: "Opening PPDB & SemiFinal Maheswara Maheswari 2027",
      school: "SMK Metland",
      date: "",
      location: "",
      tagline: "Empowering Our Chapter Through Indonesian Culture",
      contact: "",
      groupPhoto: "",
    },
    activities: [
      { text: "SMP Negeri 1 Cibitung · 4 peserta check-in", time: "Data simulasi" },
      { text: "Maam Honey mengonfirmasi kehadiran", time: "Data simulasi" },
      { text: "Undangan SMP Negeri 2 Cibitung dibuat", time: "Data simulasi" },
    ],
    messages: [
      {
        name: "Nabila Putri",
        text: "Semoga menjadi awal dari langkah besar dan prestasi yang membanggakan.  di Maheswara Maheswari 2027!",
        category: "Siswa",
      },
      {
        name: "Ani Wulandari",
        text: "Bangga melihat semangat generasi muda dalam merawat budaya dan meraih prestasi.",
        category: "Guru / Pendamping",
      },
      {
        name: "Hendra Wijaya",
        text: "Bersama kita tumbuhkan generasi yang berkarakter, kreatif, dan cinta Indonesia.",
        category: "Tamu undangan",
      },
    ],
  };
}
export function stats(rows: Invitation[]) {
  return {
    total: rows.length,
    schools: rows.filter((i) => i.category === "SMP").length,
    quota: rows.reduce((s, i) => s + i.quota, 0),
    registered: rows.reduce((s, i) => s + (i.category === "SMP" ? i.members.length : i.quota), 0),
    yes: rows.filter((i) => i.rsvp === "Hadir").length,
    no: rows.filter((i) => i.rsvp === "Tidak Hadir").length,
    pending: rows.filter((i) => i.rsvp === "Pending").length,
    checked: rows.reduce((s, i) => s + i.checked, 0),
  };
}
const StoreContext = createContext<null | {
  data: Data;
  ready: boolean;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
  save: (item: Invitation) => void;
  remove: (id: string) => void;
  checkIn: (id: string, memberIds: string[], count: number) => boolean;
  updateSettings: (s: Settings) => void;
  addMessage: (m: Message) => void;
  reset: () => void;
}>(null);
export function SambutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(seed);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sambut-demo-v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.invitations && saved.settings && saved.activities && saved.messages) {
          if (saved.settings.name === "Sambut GCP 2026")
            saved.settings.name = "Opening PPDB & SemiFinal Maheswara Maheswari 2027";
          saved.settings.groupPhoto ??= "";
          setData(saved);
        }
      }
      setLoggedIn(sessionStorage.getItem("sambut-admin") === "yes");
    } catch {
      toast.error("Data lokal tidak dapat dibaca. Data awal digunakan.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("sambut-demo-v1", JSON.stringify(data));
      } catch {
        toast.error("Penyimpanan perangkat penuh. Perubahan belum tersimpan.");
      }
    }
  }, [data, ready]);
  function activity(d: Data, text: string) {
    return [
      {
        text,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      },
      ...d.activities,
    ].slice(0, 30);
  }
  const save = (item: Invitation) => {
    if (
      !Number.isInteger(item.quota) ||
      item.quota < 1 ||
      item.checked > item.quota ||
      item.members.length > item.quota ||
      (item.category === "SMP" && (item.quota > 10 || !item.principal.trim()))
    ) {
      toast.error("Nama kepala sekolah wajib dan kuota maksimal 10.");
      return;
    }
    setData((d) => ({
      ...d,
      invitations: d.invitations.some((i) => i.id === item.id)
        ? d.invitations.map((i) => (i.id === item.id ? item : i))
        : [item, ...d.invitations],
      activities: activity(d, `Undangan ${item.name} diperbarui`),
    }));
  };
  const checkIn = (id: string, memberIds: string[], count: number) => {
    const item = data.invitations.find((i) => i.id === id);
    if (!item || item.cancelled) {
      toast.error("Undangan tidak valid atau dibatalkan.");
      return false;
    }
    const added =
      item.category === "SMP"
        ? item.members.filter((m) => memberIds.includes(m.id) && !m.present).length
        : count;
    if (!added) {
      toast.error("Sudah check-in atau belum ada peserta dipilih.");
      return false;
    }
    if (!Number.isInteger(added) || item.checked + added > item.quota || added < 1) {
      toast.error("Jumlah hadir melebihi kuota.");
      return false;
    }
    setData((d) => ({
      ...d,
      invitations: d.invitations.map((i) =>
        i.id === id
          ? {
              ...i,
              checked: i.checked + added,
              members: i.members.map((m) =>
                memberIds.includes(m.id) ? { ...m, present: true } : m,
              ),
            }
          : i,
      ),
      activities: activity(d, `${item.name} · ${added} peserta berhasil check-in`),
    }));
    toast.success(`${added} peserta berhasil check-in`);
    return true;
  };
  return (
    <StoreContext.Provider
      value={{
        data,
        ready,
        loggedIn,
        login: () => {
          sessionStorage.setItem("sambut-admin", "yes");
          setLoggedIn(true);
        },
        logout: () => {
          sessionStorage.removeItem("sambut-admin");
          setLoggedIn(false);
        },
        save,
        remove: (id) =>
          setData((d) => ({
            ...d,
            invitations: d.invitations.filter((i) => i.id !== id),
            activities: activity(d, "Undangan dihapus"),
          })),
        checkIn,
        updateSettings: (settings) => setData((d) => ({ ...d, settings })),
        addMessage: (m) => setData((d) => ({ ...d, messages: [m, ...d.messages] })),
        reset: () => setData(seed()),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useSambut() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("SambutProvider is missing");
  return c;
}
export function newInvitation(input: Invitation) {
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  return {
    ...input,
    id: crypto.randomUUID(),
    code: `GCP-${input.category === "SMP" ? "SMP" : input.category === "Guru" ? "GR" : input.category === "VIP" ? "VIP" : "ORT"}-${token}`,
  };
}
export function attendanceLabel(i: Invitation) {
  return i.checked === 0
    ? "Belum check-in"
    : i.checked === i.quota
      ? "Hadir lengkap"
      : "Hadir sebagian";
}
