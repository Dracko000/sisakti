import type { Role } from "./types";

export interface NavItem {
  icon: string;
  label: string;
  href: string;
}

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { icon: "home", label: "Beranda", href: "/student" },
    { icon: "libraryBig", label: "Katalog Buku", href: "/student/library" },
    { icon: "video", label: "Kelas Live", href: "/student/live" },
    { icon: "penLine", label: "Papan Interaktif", href: "/student/board" },
    { icon: "brain", label: "Kuis & Latihan", href: "/student/quiz" },
    { icon: "clipboardList", label: "Tugas", href: "/student/tasks" },
    { icon: "calendarDays", label: "Jadwal", href: "/student/schedule" },
    { icon: "award", label: "Nilai", href: "/student/grades" },
  ],
  teacher: [
    { icon: "layoutDashboard", label: "Dashboard", href: "/teacher" },
    { icon: "presentation", label: "Studio Live", href: "/teacher/studio" },
    { icon: "penLine", label: "Papan & Nilai Tulis", href: "/teacher/boards" },
    { icon: "bookOpen", label: "Modul & Materi", href: "/teacher/modules" },
    { icon: "listChecks", label: "Bank Soal", href: "/teacher/bank" },
    { icon: "fileText", label: "Buku Nilai", href: "/teacher/gradebook" },
    { icon: "userCheck", label: "Presensi", href: "/teacher/attendance" },
    { icon: "scrollText", label: "RPP / Silabus", href: "/teacher/rpp" },
  ],
  parent: [
    { icon: "home", label: "Ringkasan", href: "/parent" },
    { icon: "trendingUp", label: "Perkembangan", href: "/parent/progress" },
    { icon: "calendarCheck", label: "Presensi", href: "/parent/attendance" },
    { icon: "award", label: "Nilai & Rapor", href: "/parent/grades" },
    { icon: "messageSquare", label: "Catatan Guru", href: "/parent/notes" },
  ],
  admin: [
    { icon: "layoutDashboard", label: "Dashboard Sekolah", href: "/admin" },
    { icon: "usersRound", label: "Pengguna", href: "/admin/users" },
    { icon: "school", label: "Kelas & Rombel", href: "/admin/classes" },
    { icon: "server", label: "Integrasi Dapodik", href: "/admin/dapodik" },
    { icon: "libraryBig", label: "Katalog SIBI", href: "/admin/catalog" },
    { icon: "activity", label: "Log Aktivitas", href: "/admin/logs" },
  ],
  superadmin: [
    { icon: "gauge", label: "Tenant & Platform", href: "/superadmin" },
    { icon: "usersRound", label: "Semua Pengguna", href: "/superadmin/users" },
    { icon: "activity", label: "Audit Log", href: "/superadmin/logs" },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Siswa",
  teacher: "Guru",
  parent: "Orang Tua",
  admin: "Admin Sekolah",
  superadmin: "Admin Platform",
};
