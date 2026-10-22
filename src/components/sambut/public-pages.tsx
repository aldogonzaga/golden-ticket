import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Clock3,
  Sparkles,
  Heart,
  GraduationCap,
  Flower2,
  Quote,
  Download,
  Printer,
  Share2,
  Copy,
  Ticket,
  Maximize,
  Volume2,
  VolumeX,
  X,
  CalendarPlus,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import templeImage from "@/assets/borobudur-dawn.jpg";
import maheswaraGroupPhoto from "@/assets/mhs.jpeg";
import medleyMusic from "@/assets/Medley.mp3";
import popupImage from "@/assets/PopUp1.jpeg";
import background2Image from "@/assets/background2.jpeg";
import {
  useSambut,
  blankInvitation,
  newInvitation,
  type Invitation,
} from "@/lib/sambut/store";
import { eventDate, inviteURL } from "@/lib/sambut/utils";
import { PublicLayout } from "./public-layout";
import { SectionLabel, ArrowLink, Brand, Badge, RsvpBadge, Empty, copyText } from "./shared";

export const schedule = [
  ["08.00 – 09.00", "Sugeng Rawuh", "Registrasi tamu, penyambutan, dan pembukaan gerbang acara."],
  ["09.00 – 09.30", "Harmoni Pembuka", "Pembukaan dan persembahan seni budaya Nusantara."],
  ["09.30 – 11.00", "Panggung Prestasi", "Selebrasi karya, potensi, dan pencapaian generasi muda."],
  ["11.00 – 12.00", "Langkah Bersama", "Penandatanganan MOU, ramah tamah, dan penutupan."],
];

// URL Google Calendar dengan Waktu Acara
const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
  "Opening PPDB & SemiFinal Maheswara Maheswari 2027"
)}&dates=20261024T060000Z/20261024T080000Z&details=${encodeURIComponent(
  "Merangkai mimpi, merayakan potensi, dan melangkah bersama dalam kehangatan budaya Indonesia."
)}&location=${encodeURIComponent("Milenia Hub - Platinum Cineplex")}`;

function Countdown() {
  const { data } = useSambut();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data.settings.date || now === null)
    return (
      <div>
        <div className="fact-value">Waktu</div>
        <div className="fact-note">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-inherit inline-flex items-center gap-1"
            title="Simpan Jam Acara ke Kalender"
          >
            13.00 - 15.00 WIB <CalendarPlus size={14} />
          </a>
        </div>
      </div>
    );

  const diff = Math.max(0, new Date(data.settings.date).getTime() - now);
  if (!diff)
    return (
      <div>
        <div className="fact-label">HARI ISTIMEWA</div>
        <div className="fact-value">Waktunya merayakan bersama</div>
      </div>
    );

  const parts = [
    Math.floor(diff / 86400000),
    Math.floor(diff / 3600000) % 24,
    Math.floor(diff / 60000) % 60,
    Math.floor(diff / 1000) % 60,
  ];

  return (
    <div className="countdown">
      {parts.map((p, i) => (
        <div key={i}>
          {String(p).padStart(2, "0")}
          <small>{["HARI", "JAM", "MENIT", "DETIK"][i]}</small>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const { data, ready } = useSambut();
  const navigate = useNavigate();
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const invitationCode = new URLSearchParams(searchStr).get("undangan");
  const invitation = invitationCode
    ? data.invitations.find((item) => item.code === invitationCode && !item.cancelled)
    : undefined;

  const revealRoot = useRef<HTMLElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const [curtainStage, setCurtainStage] = useState<"closed" | "opening" | "done">("closed");
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurtainStage("done");
      return;
    }
    const openTimer = window.setTimeout(() => setCurtainStage("opening"), 650);
    const finishTimer = window.setTimeout(() => setCurtainStage("done"), 3350);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    const root = revealRoot.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            activeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );
    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${(index % 4) * 85}ms`);
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  function toggleMusic() {
    const audio = musicRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => toast.error("Musik tidak dapat diputar pada peramban ini"));
    } else {
      audio.pause();
    }
  }

  return (
    <PublicLayout>
      <main className="public-home" ref={revealRoot}>
        <section className="event-hero">
          <img
            className="hero-image"
            src={templeImage}
            width={1920}
            height={1088}
            alt="Stupa Borobudur dan pegunungan Jawa saat matahari terbit"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-bottom-shade" />
          <div className="page-width hero-content">
            <div className="hero-edition"></div>
            <h1>
              Opening PPDB &
              <br />
              SemiFinal <em>Maheswara Maheswari.</em>
            </h1>
            <p className="hero-tagline">“{data.settings.tagline}”</p>
            <p className="hero-description">
              Merangkai mimpi, merayakan potensi, dan melangkah bersama dalam kehangatan budaya
              Indonesia.
            </p>
            <div className="hero-buttons">
              {invitation ? (
                <Button asChild size="lg">
                  <Link to="/ticket/$code" params={{ code: invitation.code }}>
                    Klaim Tiket Undangan <ArrowUpRight />
                  </Link>
                </Button>
              ) : invitationCode && ready ? (
                <p className="field-note" role="alert">
                  Undangan tidak ditemukan atau sudah dibatalkan. Silakan hubungi panitia.
                </p>
              ) : invitationCode ? (
                <p className="field-note" role="status">
                  Memuat undangan…
                </p>
              ) : (
                <Button asChild size="lg">
                  <a href="#Klaim Tiket">
                    Klaim Tiket <ArrowUpRight />
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="outline-hero">
                <a href="#rundown-acara">
                  Detail Acara <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="event-facts">
          <div className="page-width facts-grid" data-reveal>
            {/* Waktu Perayaan */}
            <div className="fact">
              <CalendarDays />
              <div>
                <div className="fact-value">{eventDate(data.settings.date)}</div>
                <div className="fact-note">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-inherit inline-flex items-center gap-1"
                    title="Simpan tanggal istimewanya ke Kalender"
                  >
                    {data.settings.date
                      ? "Simpan tanggal istimewanya"
                      : "24 October 2026 Dan 31 October 2026"}{" "}
                    <CalendarPlus size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Tempat Pertemuan */}
            <div className="fact">
              <MapPin />
              <div>
                <div className="fact-value">
                  {data.settings.location || "Lokasi Acara"}
                </div>
                <div className="fact-note">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      "Milenia Hub Platinum Cineplex"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-inherit inline-flex items-center gap-1"
                  >
                    Milenia Hub - Platinum Cineplex ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Jam & Countdown */}
            <div className="fact">
              <Clock3 />
              <Countdown />
            </div>
          </div>
        </section>

        <section className="about-section" id="tentang">
          <div className="page-width">
            <div className="home-story-layout">
              <div className="home-story-heading" data-reveal>
                <SectionLabel>LEBIH DARI SEBUAH PERAYAAN</SectionLabel>
                <h2 className="display-heading">
                  Berakar dalam budaya. Bertumbuh dalam <em>prestasi.</em>
                </h2>
              </div>
              <figure className="home-story-photo" data-reveal>
                <div className="home-photo-topline">
                  <span>CATATAN KEBERSAMAAN</span>
                  <span>MM · 2027</span>
                </div>
                <div className="home-photo-image">
                  <img
                    src={maheswaraGroupPhoto}
                    width={1200}
                    height={900}
                    alt="Kebersamaan siswa Maheswara Maheswari bersama Metland School"
                    loading="lazy"
                  />
                  <div className="home-photo-stamp" aria-hidden="true">
                    <strong>MM</strong>
                    <span>TOGETHER</span>
                    <small>2027</small>
                  </div>
                </div>
                <figcaption>
                  <span>Maheswara Maheswari</span>
                  <small>Tumbuh dan melangkah bersama</small>
                </figcaption>
              </figure>
              <div className="home-story-copy" data-reveal>
                <p>
                  Opening PPDB & SemiFinal Maheswara Maheswari 2027 adalah perayaan potensi,
                  kreativitas, dan langkah baru generasi muda.
                </p>
                <p>
                  Maheswara Maheswari menjadi ruang untuk bertumbuh dalam karakter dan prestasi,
                  sekaligus merawat budaya Indonesia bersama.
                </p>
                <a href="#rundown-acara" className="arrow-link">
                  Lihat rangkaian acara <ArrowRight size={17} />
                </a>
              </div>
            </div>
            <div className="values-row">
              <div className="value-item" data-reveal>
                <Flower2 />
                <div>
                  <h3>Warisan yang Menginspirasi</h3>
                  <p>Budaya Nusantara sebagai jati diri.</p>
                </div>
              </div>
              <div className="value-item" data-reveal>
                <GraduationCap />
                <div>
                  <h3>Generasi Penuh Potensi</h3>
                  <p>Merayakan karya dan langkah berprestasi.</p>
                </div>
              </div>
              <div className="value-item" data-reveal>
                <Heart />
                <div>
                  <h3>Kebersamaan yang Berarti</h3>
                  <p>Momen hangat, kenangan yang melekat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seksi Rangkaian Momen */}
        <section
          className="preview-section relative overflow-hidden bg-cover bg-center bg-no-repeat text-white py-16"
          id="rundown-acara"
          style={{
            backgroundImage: `url(${background2Image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />

          <div className="page-width relative z-10">
            <div className="section-top">
              <div data-reveal>
                <SectionLabel>RANGKAIAN MOMEN</SectionLabel>
                <h2 className="display-heading text-white">Setiap momen, punya cerita.</h2>
              </div>
              <ArrowLink to="/event/schedule">Lihat jadwal lengkap</ArrowLink>
            </div>
            <div className="schedule-preview">
              {schedule.map(([time, title, text], index) => (
                <article className="schedule-step" key={title} data-reveal>
                  <time className="text-white font-semibold drop-shadow">{time} WIB</time>
                  <div className="schedule-marker" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="schedule-copy">
                    <h3 className="text-white font-bold text-xl drop-shadow">{title}</h3>
                    <p className="text-gray-100 font-normal drop-shadow-sm">{text}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="field-note mt-7 text-gray-200" data-reveal>
              *Rancangan jadwal simulasi. Waktu resmi akan diumumkan panitia.
            </p>
          </div>
        </section>

        <section className="messages-section py-12" id="kesan-pesan">
          <div className="page-width">
            <MessagesSectionContent />
          </div>
        </section>

        {!invitationCode && (
          <section className="registration-section" id="Klaim Tiket">
            <div className="page-width">
              <EventRegistrationForm />
            </div>
          </section>
        )}

        {curtainStage !== "done" && (
          <div className={`opening-curtain opening-curtain--${curtainStage}`} aria-hidden="true">
            <div className="curtain-panel curtain-panel-left" />
            <div className="curtain-panel curtain-panel-right" />
            <div className="curtain-centerpiece">
              <span className="brand-mark">
                <Sparkles strokeWidth={1.4} />
              </span>
              <span>SELAMAT DATANG</span>
              <strong>{data.settings.name}</strong>
              <small>Maheswara Maheswari · 2027</small>
            </div>
          </div>
        )}
        <audio
          aria-label="Musik pengiring Medley"
          hidden
          loop
          preload="none"
          ref={musicRef}
          src={medleyMusic}
          onPlay={() => setMusicPlaying(true)}
          onPause={() => setMusicPlaying(false)}
          onError={() =>
            toast.error("File Medley.mp3 tidak dapat dimuat atau formatnya tidak didukung")
          }
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`music-toggle ${musicPlaying ? "is-playing" : ""}`}
          aria-label={musicPlaying ? "Matikan musik Medley" : "Putar musik Medley"}
          aria-pressed={musicPlaying}
          title={musicPlaying ? "Matikan musik Medley" : "Putar musik Medley"}
          onClick={toggleMusic}
        >
          {musicPlaying ? <VolumeX /> : <Volume2 />}
        </Button>
      </main>
    </PublicLayout>
  );
}

function EventRegistrationForm() {
  const { save } = useSambut();
  const navigate = useNavigate();
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  function handleInitialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowPromoPopup(true);
  }

  function confirmAndGetTicket() {
    setShowPromoPopup(false);
    const invitation = newInvitation({
      ...blankInvitation(),
      name: "Tamu Undangan",
      category: "VIP",
      institution: "Umum",
      principal: "",
      pic: "",
      title: "",
      phone: "-",
      quota: 1,
      members: [],
      rsvp: "Hadir",
    });
    save(invitation);
    navigate({ to: "/ticket/$code", params: { code: invitation.code } });
  }

  return (
    <div className="registration-content">
      {showPromoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-sm w-full bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800">
            <button
              onClick={() => setShowPromoPopup(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              aria-label="Tutup pop-up"
            >
              <X size={20} />
            </button>

            <div className="relative">
              <img
                src={popupImage}
                alt="Nobar Movie Package Platinum Cineplex"
                className="w-full h-auto object-cover max-h-[70vh]"
              />
            </div>

            <div className="p-4 bg-neutral-900 text-center">
              <Button
                onClick={confirmAndGetTicket}
                className="w-full text-sm font-semibold"
              >
                Lanjutkan ke Tiket Saya
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="registration-heading" data-reveal>
        <SectionLabel>MENJADI BAGIAN DARI CERITA</SectionLabel>
        <h2>Mari hadir. Mari merayakan.</h2>
        <p>Klik tombol di bawah untuk langsung mendapatkan tiket acara.</p>
      </div>

      <form className="form-panel registration-form" onSubmit={handleInitialSubmit} data-reveal>
        <Button type="submit" className="w-full mt-2">
          Ambil Tiket <Ticket />
        </Button>

        <p className="field-note mt-4 text-center">
          Status kehadiran dan data undangan akan tercatat secara otomatis.
        </p>
      </form>
    </div>
  );
}

const titah = {
  heading: ["Menjaga Marwah,", "Mencetak Sejarah"],
  author: "Dr. Darmawan Sunarja, Drs., MM.Par",
  role: "Kepala Sekolah",
  id: "Selamat datang di SMK Metland Cibitung. Terima kasih telah menjadi bagian dari Generasi Cinta Prestasi (GCP) yang bukan hanya sekadar capaian akademis, melainkan komitmen untuk memanggul warisan luhur budaya nusantara di tengah pusaran modernitas. Kami memadukan disiplin tinggi dengan tata krama budaya ketimuran untuk memastikan setiap lulusan tidak hanya terampil, tetapi juga berkarakter unggul.",
  jv: "Sugeng rawuh ing SMK Metland Cibitung. Matur nuwun sampun dados pérangan saking Generasi Cinta Prestasi (GCP). GCP boten namung babagan prestasi, nanging ugi babagan nguri-uri budaya lan nilai-nilai luhur Nusantara ing tengahing perkembangan jaman. Ing sekolah kita, kedisiplinan lan tata krama dados landhesan kangge mbentuk para lulusan ingkang trampil, kompeten, saha gadhah budi pekerti lan karakter ingkang unggul.",
};

export function TitahSection() {
  const { data } = useSambut();
  const [playing, setPlaying] = useState<"" | "id" | "jv">("");
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function speak(key: "id" | "jv") {
    if (!("speechSynthesis" in window)) {
      toast.error("Peramban ini tidak mendukung suara");
      return;
    }
    window.speechSynthesis.cancel();
    if (playing === key) {
      setPlaying("");
      return;
    }
    const utter = new SpeechSynthesisUtterance(key === "id" ? titah.id : titah.jv);
    utter.lang = key === "id" ? "id-ID" : "jv-ID";
    utter.rate = 0.94;
    utter.onend = () => setPlaying("");
    utter.onerror = () => setPlaying("");
    setPlaying(key);
    window.speechSynthesis.speak(utter);
  }
  const quotes = [
    { key: "id" as const, label: "Bahasa Indonesia", text: titah.id },
    { key: "jv" as const, label: "Basa Jawa", text: titah.jv },
  ];
  return (
    <section className="titah-section">
      <div className="page-width titah-layout">
        <figure className="titah-card">
          <span className="titah-crest">
            <Sparkles />
            <strong>{data.settings.school || "SMK Metland"}</strong>
            <small>Generasi Cinta Prestasi</small>
          </span>
          <figcaption>
            <span className="titah-author">{titah.author}</span>
            <span className="titah-role">{titah.role}</span>
          </figcaption>
        </figure>
        <div className="titah-body">
          <SectionLabel>TITAH KEBESARAN</SectionLabel>
          <h2 className="display-heading">
            {titah.heading[0]}
            <br />
            <em>{titah.heading[1]}</em>
          </h2>
          {quotes.map((q) => (
            <div className="titah-quote" key={q.key}>
              <div className="quote-head">
                <span className="quote-lang">
                  <Quote />
                  {q.label}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`quote-play ${playing === q.key ? "playing" : ""}`}
                  onClick={() => speak(q.key)}
                  aria-label={
                    playing === q.key
                      ? `Hentikan suara ${q.label}`
                      : `Dengarkan titah dalam ${q.label}`
                  }
                >
                  {playing === q.key ? <VolumeX /> : <Volume2 />}
                  {playing === q.key ? "Hentikan" : "Dengarkan"}
                </Button>
              </div>
              <p>{q.text}</p>
              <span className="quote-mark" aria-hidden="true">
                ”
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SchedulePage() {
  return (
    <PublicLayout>
      <main className="page-width inner-page">
        <SectionLabel>RANGKAIAN ACARA</SectionLabel>
        <h1 className="page-heading">Momen yang kita nantikan.</h1>
        <p className="page-intro">
          Dari sambutan hangat hingga langkah kolaborasi. Setiap bagian dirangkai untuk menghadirkan
          pengalaman yang berkesan.
        </p>
        <div className="subtle-notice">
          Rancangan jadwal simulasi — tanggal, waktu, dan susunan acara resmi menunggu konfirmasi
          panitia.
        </div>
        <div className="timeline">
          {schedule.map(([time, title, text], i) => (
            <div className="timeline-row" key={title}>
              <time>
                {time}
                <br />
                <small>WIB</small>
              </time>
              <div>
                <SectionLabel>0{i + 1}</SectionLabel>
                <h3 className="mt-3">{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}

function MessagesSectionContent() {
  const { data, addMessage } = useSambut();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    addMessage({
      name: String(f.get("name")).trim(),
      text: String(f.get("text")).trim(),
      category: "Tamu Maheswara Maheswari 2027",
    });
    e.currentTarget.reset();
    toast.success("Pesan Anda telah ditambahkan");
  }

  const marqueeMessages = [...data.messages, ...data.messages];

  return (
    <div>
      <style>{`
        @keyframes marqueeAuto {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex !important;
          width: max-content !important;
          animation: marqueeAuto 22s linear infinite !important;
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      <SectionLabel>SUARA & HARAPAN</SectionLabel>
      <h1 className="page-heading mb-2">yang menghangatkan.</h1>
      <p className="page-intro mb-8">
        Titipkan doa, semangat, dan harapan untuk Maheswara Maheswari 2027.
      </p>

      <div className="relative w-full overflow-hidden mb-10 py-4 no-scrollbar">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black to-transparent" />

        <div className="marquee-track gap-6">
          {marqueeMessages.map((m, i) => (
            <article className="message-card w-[320px] shrink-0" key={i}>
              <Quote />
              <blockquote>“{m.text}”</blockquote>
              <div className="message-author">
                {m.name}
                <span>{m.category}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form className="form-panel" onSubmit={submit}>
        <h2>Tinggalkan sebuah pesan.</h2>
        <div className="field mt-4">
          <span>Nama Anda</span>
          <input
            name="name"
            aria-label="Nama Anda"
            required
            maxLength={80}
            placeholder="Nama lengkap"
          />
        </div>
        <div className="field mt-5">
          <span>Kesan & pesan</span>
          <textarea
            name="text"
            aria-label="Kesan dan pesan"
            required
            maxLength={500}
            placeholder="Tuliskan harapan terbaik Anda…"
          />
        </div>
        <div className="form-actions mt-5">
          <Button type="submit">
            Kirim Pesan <ArrowUpRight />
          </Button>
        </div>
      </form>
    </div>
  );
}

export function MessagesPage() {
  return (
    <PublicLayout>
      <main className="page-width inner-page">
        <MessagesSectionContent />
      </main>
    </PublicLayout>
  );
}

export function RsvpPage() {
  return (
    <PublicLayout>
      <main className="registration-section">
        <div className="page-width">
          <EventRegistrationForm />
        </div>
      </main>
    </PublicLayout>
  );
}

function ticketIdentity(item: Invitation) {
  const name = item.name;
  const institution = item.category === "SMP" ? (item.principal || "") : item.institution;
  const role =
    item.title ||
    (item.category === "SMP"
      ? item.principal ? `${item.principal} · Kepala Sekolah` : "Kepala Sekolah"
      : item.category === "Guru"
        ? "Guru / Pendidik"
        : item.category === "VIP"
          ? item.vipLevel || "Tamu Kehormatan"
          : `${item.relationship || "Orang Tua"} / Wali`);
  return { name, institution, role };
}

export function GoldenTicket({
  item,
  member,
  customName,
}: {
  item: Invitation;
  member?: { name: string; role: string };
  customName?: string;
}) {
  const { data } = useSambut();
  const identity = ticketIdentity(item);
  const dateTime = data.settings.date
    ? new Date(data.settings.date).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Tanggal dan waktu ";
  const progress = Math.min(100, Math.round((item.checked / Math.max(1, item.quota)) * 100));
  const ticketName = customName || member?.name || identity.name;

  return (
    <div className="ticket" id="golden-ticket">
      <div className="ticket-top">
        <Brand compact />
        <div className="ticket-event">{data.settings.name}</div>
        <h2>{ticketName}</h2>
        <p className="ticket-recipient">
          {member
            ? `${member.role} · ${item.name}`
            : item.category === "SMP"
              ? `${identity.name} · ${identity.role}`
              : identity.role}
        </p>
        {!member && identity.institution && item.category !== "SMP" && (
          <p className="ticket-institution">{identity.institution}</p>
        )}
        <div className="ticket-seat">
          Seat {item.seat || "Belum ditetapkan"} · {item.quota} orang
        </div>
      </div>
      <div className="ticket-location">
        <MapPin aria-hidden="true" />
        <div>
          <strong>{dateTime}</strong>
          <span>LOCATION · {data.settings.location || "Segera diumumkan"}</span>
          {data.settings.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.settings.location)}`}
              target="_blank"
              rel="noreferrer"
            >
              Buka peta
            </a>
          )}
        </div>
      </div>
      <div className="ticket-perforation" aria-hidden="true" />
      <div className="ticket-attendance">
        <div className="ticket-attendance-heading">
          <span>
            {item.category === "SMP" ? "Rombongan yang sudah masuk" : "Tamu yang sudah masuk"}
          </span>
          <strong>
            {item.checked} <small>/ {item.quota}</small>
          </strong>
        </div>
        <div
          className="ticket-progress"
          role="progressbar"
          aria-label="Jumlah tamu yang sudah check-in"
          aria-valuemin={0}
          aria-valuemax={item.quota}
          aria-valuenow={Math.min(item.checked, item.quota)}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong className="ticket-remaining">
          Sisa {Math.max(0, item.quota - item.checked)} orang dapat masuk.
        </strong>
      </div>
      <div className="ticket-perforation" aria-hidden="true" />
      <div className="qr-paper">
        <QRCodeSVG value={item.code} size={240} level="M" bgColor="transparent" />
      </div>
      <div className="ticket-code-row">
        <div className="ticket-code">{item.code}</div>
        <RsvpBadge value={item.rsvp} />
      </div>
      <p className="ticket-note">
        {item.category === "SMP"
          ? "Tunjukkan barcode ini kepada petugas di pintu masuk. Satu tiket berlaku untuk seluruh rombongan."
          : "Tunjukkan barcode ini kepada petugas saat tiba di lokasi."}
      </p>
    </div>
  );
}

export function TicketPage({ code, customName }: { code: string; customName?: string }) {
  const { data, ready } = useSambut();
  const ref = useRef<HTMLDivElement>(null);
  const item = data.invitations.find((i) => i.code === code && !i.cancelled);
  const identity = item ? ticketIdentity(item) : { name: "", institution: "", role: "" };
  const displayName = customName || identity.name || "Tamu Undangan";

  async function download() {
    if (!ref.current) return;
    const ticket = ref.current.querySelector<HTMLElement>(".ticket");
    if (!ticket) return;
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(ticket, {
        pixelRatio: 2,
        width: ticket.offsetWidth,
        height: ticket.offsetHeight,
        style: { margin: "0", maxWidth: "none" },
      });
      const a = document.createElement("a");
      a.download = `Golden-Ticket-${code}.png`;
      a.href = url;
      a.click();
    } catch {
      toast.error("Unduhan gagal. Gunakan Cetak / PDF sebagai alternatif.");
    }
  }

  return (
    <PublicLayout>
      <main className="ticket-page">
        {!ready ? (
          <div className="page-width inner-page">
            <Empty title="Memuat undangan…" text="" />
          </div>
        ) : item ? (
          <section className="ticket-page-section">
            <div className="page-width ticket-page-layout">
              <header className="ticket-page-heading">
                <div>
                  <SectionLabel>TIKET DIGITAL · {item.category.toUpperCase()}</SectionLabel>
                  <h1>Golden Ticket</h1>
                  <p>
                    Undangan untuk <strong>{displayName}</strong>. Tunjukkan QR ini kepada panitia
                    saat tiba di lokasi.
                  </p>
                </div>
                <Badge tone="gold">{item.rsvp === "Tidak Hadir" ? "Tidak Hadir" : item.rsvp}</Badge>
              </header>
              <div className="ticket-page-card" ref={ref}>
                <GoldenTicket item={item} customName={displayName} />
              </div>
              <div className="ticket-actions">
                <Button onClick={download}>
                  <Download />
                  Unduh PNG
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer />
                  Cetak / PDF
                </Button>
                <Button variant="outline" onClick={() => copyText(inviteURL(code))}>
                  <Copy />
                  Salin Tautan
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`Anda diundang ke ${data.settings.name}.${inviteURL(code)}`)}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <Share2 />
                  Bagikan
                </Button>
                <Button
                  variant="outline"
                  aria-label="Layar penuh tiket"
                  title="Layar penuh tiket"
                  onClick={() =>
                    ref.current
                      ?.requestFullscreen?.()
                      .catch(() => toast.error("Layar penuh tidak tersedia"))
                  }
                >
                  <Maximize />
                </Button>
              </div>
              <div className="text-center ticket-page-footer">
                <ArrowLink to="/">Kembali ke halaman acara</ArrowLink>
              </div>
            </div>
          </section>
        ) : (
          <div className="page-width inner-page">
            <Empty
              title="Undangan tidak ditemukan"
              text="Periksa kembali tautan atau hubungi panitia acara."
            />
          </div>
        )}
      </main>
    </PublicLayout>
  );
}