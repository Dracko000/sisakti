import { AppShell } from "@/components/AppShell";
import { Card, Pill, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { attendance } from "@/lib/seed";

export default function AttendancePage() {
  const hadir = attendance.filter((a) => a.status === "Hadir").length;
  return (
    <AppShell role="teacher" title="Presensi" subtitle="Pencatatan kehadiran otomatis saat sesi live">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-muted">Hadir</p><p className="font-display text-2xl font-bold text-ok-dark">{hadir}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted">Izin / Sakit</p><p className="font-display text-2xl font-bold text-amber-700">{attendance.length - hadir}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted">Total Siswa</p><p className="font-display text-2xl font-bold text-ink">{attendance.length}</p></Card>
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line-2 px-5 py-3">
          <Icon name="userCheck" size={16} className="text-primary" />
          <p className="font-display text-sm font-bold text-ink">Presensi Sesi Live · Matematika VIII-A</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sl-50 text-left text-xs font-bold text-muted">
              <th className="px-5 py-3">Siswa</th>
              <th className="px-5 py-3">Waktu Bergabung</th>
              <th className="px-5 py-3">Durasi</th>
              <th className="px-5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.studentId} className="border-t border-line-2">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={a.initials} color={a.color} size={32} />
                    <span className="font-semibold text-ink">{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-text">{a.joinedAt}</td>
                <td className="px-5 py-3 text-text">{a.durationMin ? `${a.durationMin} menit` : "—"}</td>
                <td className="px-5 py-3 text-center">
                  <Pill bg={a.status === "Hadir" ? "#dcfce7" : "#fff3e0"} fg={a.status === "Hadir" ? "#15803d" : "#b45309"}>{a.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
