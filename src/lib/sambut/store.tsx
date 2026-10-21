import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getInvitationsApi,
  getSettingsApi,
  getActivitiesApi,
  getMessagesApi,
  createInvitationApi,
  updateInvitationApi,
  deleteInvitationApi,
  checkInApi,
  updateSettingsApi,
  addMessageApi,
  resetSimulationApi,
} from "./api";

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
export type Data = {
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

export function blankData(): Data {
  return {
    invitations: [],
    settings: {
      name: "Opening PPDB & SemiFinal Maheswara Maheswari 2027",
      school: "SMK Metland",
      date: "",
      location: "",
      tagline: "Empowering Our Chapter Through Indonesian Culture",
      contact: "",
      groupPhoto: "",
    },
    activities: [],
    messages: [],
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
  connectedToDb: boolean;
  login: () => void;
  logout: () => void;
  save: (item: Invitation) => Promise<void>;
  remove: (id: string) => Promise<void>;
  checkIn: (id: string, memberIds: string[], count: number) => boolean;
  updateSettings: (s: Settings) => Promise<void>;
  addMessage: (m: Message) => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
}>(null);

export function SambutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(blankData);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [connectedToDb, setConnectedToDb] = useState(false);

  // Clear obsolete demo cache from localStorage once
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const migrated = localStorage.getItem("sambut-db-connected");
        if (!migrated) {
          localStorage.removeItem("sambut-demo-v1");
          localStorage.setItem("sambut-db-connected", "true");
        }
      }
    } catch {}
  }, []);

  const loadData = async () => {
    try {
      const [invRes, setRes, actRes, msgRes] = await Promise.all([
        getInvitationsApi(),
        getSettingsApi(),
        getActivitiesApi(),
        getMessagesApi(),
      ]);

      if (invRes.success && setRes.success) {
        setData({
          invitations: (invRes.data || []).map((inv) => ({
            ...inv,
            members: inv.members || [],
            mouDate: inv.mouDate ?? (inv as any).mou_date ?? "",
            vipLevel: inv.vipLevel ?? (inv as any).vip_level ?? "VIP",
          })),
          settings: setRes.data || blankData().settings,
          activities: actRes.data || [],
          messages: msgRes.data || [],
        });
        setConnectedToDb(true);
      }
    } catch (err) {
      console.warn("Backend API tidak dapat dijangkau, menggunakan data lokal:", err);
      setConnectedToDb(false);
      try {
        const raw = localStorage.getItem("sambut-clean-v2");
        if (raw) setData(JSON.parse(raw));
      } catch {}
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    setLoggedIn(sessionStorage.getItem("sambut-admin") === "yes");
    loadData();
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("sambut-clean-v2", JSON.stringify(data));
      } catch {}
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

  const save = async (item: Invitation) => {
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

    const isExisting = data.invitations.some(
      (i) => (item.id && i.id === item.id) || (item.code && i.code === item.code),
    );

    // Optimistic local state update
    setData((d) => ({
      ...d,
      invitations: isExisting
        ? d.invitations.map((i) => (i.id === item.id ? item : i))
        : [item, ...d.invitations],
      activities: activity(d, `Undangan ${item.name} diperbarui`),
    }));

    try {
      if (isExisting) {
        const res = await updateInvitationApi(item.id, item);
        if (res.data) {
          setData((d) => ({
            ...d,
            invitations: d.invitations.map((i) => (i.id === res.data.id ? { ...res.data, members: res.data.members || [] } : i)),
          }));
        }
      } else {
        const res = await createInvitationApi(item);
        if (res.data) {
          setData((d) => ({
            ...d,
            invitations: d.invitations.map((i) => (i.id === item.id ? { ...res.data, members: res.data.members || [] } : i)),
          }));
        }
      }
      toast.success(`Undangan ${item.name} berhasil disimpan`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Gagal menyimpan ke server backend.");
    }
  };

  const remove = async (id: string) => {
    setData((d) => ({
      ...d,
      invitations: d.invitations.filter((i) => i.id !== id),
      activities: activity(d, "Undangan dihapus"),
    }));

    try {
      await deleteInvitationApi(id);
      toast.success("Undangan berhasil dihapus");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Gagal menghapus dari server backend.");
    }
  };

  const checkIn = (id: string, memberIds: string[], count: number) => {
    const item = data.invitations.find((i) => i.id === id);
    if (!item || item.cancelled) {
      toast.error("Undangan tidak valid atau dibatalkan.");
      return false;
    }

    const remainingQuota = item.quota - item.checked;
    if (remainingQuota <= 0) {
      toast.error("Kuota undangan sudah penuh atau sudah check-in lengkap.");
      return false;
    }

    let added = 0;
    let updatedMembers = [...(item.members || [])];

    if (item.category === "SMP") {
      if (memberIds && memberIds.length > 0) {
        const unpresentSelected = updatedMembers.filter(
          (m) => memberIds.includes(m.id) && !m.present,
        );
        added = unpresentSelected.length;
        if (added > 0) {
          updatedMembers = updatedMembers.map((m) =>
            memberIds.includes(m.id) ? { ...m, present: true } : m,
          );
        }
      } else {
        // No specific member IDs passed (e.g. quick auto check-in from scanner)
        const unpresentMembers = updatedMembers.filter((m) => !m.present);
        if (unpresentMembers.length > 0) {
          added = Math.min(unpresentMembers.length, remainingQuota);
          updatedMembers = updatedMembers.map((m) => ({ ...m, present: true }));
        } else {
          // If no members registered, check in 1 person (ticket bearer/representative)
          added = Math.min(count || 1, remainingQuota);
        }
      }
    } else {
      added = Math.min(count || remainingQuota, remainingQuota);
    }

    if (!added || added < 1) {
      toast.error("Sudah check-in atau belum ada peserta dipilih.");
      return false;
    }
    if (item.checked + added > item.quota) {
      toast.error("Jumlah hadir melebihi kuota.");
      return false;
    }

    const newChecked = item.checked + added;
    const updatedItem = {
      ...item,
      checked: newChecked,
      members: updatedMembers,
    };

    setData((d) => ({
      ...d,
      invitations: d.invitations.map((i) => (i.id === id ? updatedItem : i)),
      activities: activity(d, `${item.name} · ${added} peserta berhasil check-in`),
    }));

    // Sync to backend Laravel MySQL
    checkInApi({ id, member_ids: memberIds, count: added })
      .then((res) => {
        if (res.data) {
          setData((d) => ({
            ...d,
            invitations: d.invitations.map((i) =>
              i.id === res.data.id ? { ...res.data, members: res.data.members || [] } : i,
            ),
          }));
        }
      })
      .catch((err) => {
        console.error("CheckIn API sync error:", err);
      });

    toast.success(`${added} peserta berhasil check-in`);
    return true;
  };

  const updateSettings = async (settings: Settings) => {
    setData((d) => ({ ...d, settings }));
    try {
      await updateSettingsApi(settings);
      toast.success("Pengaturan berhasil disimpan ke database");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan pengaturan ke database");
    }
  };

  const addMessage = async (m: Message) => {
    setData((d) => ({ ...d, messages: [m, ...d.messages] }));
    try {
      await addMessageApi(m);
    } catch (e) {
      console.error("Gagal menyimpan pesan ke database", e);
    }
  };

  const reset = async () => {
    try {
      await resetSimulationApi();
      await loadData();
      toast.success("Data berhasil direset dari database");
    } catch {
      setData(blankData());
    }
  };

  return (
    <StoreContext.Provider
      value={{
        data,
        ready,
        loggedIn,
        connectedToDb,
        login: () => {
          sessionStorage.setItem("sambut-admin", "yes");
          setLoggedIn(true);
        },
        logout: () => {
          sessionStorage.removeItem("sambut-admin");
          setLoggedIn(false);
        },
        save,
        remove,
        checkIn,
        updateSettings,
        addMessage,
        reset,
        refresh: loadData,
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
