import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, LogOut, RefreshCw } from "lucide-react";

type Status = "in_afwachting" | "bevestigd" | "wachtlijst" | "afgewezen";

interface Registration {
  id: string;
  voornaam: string;
  bedrijf: string;
  functie: string;
  email: string;
  telefoon: string | null;
  thema: string;
  moment: string;
  toelichting: string | null;
  status: Status;
  notitie: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
  in_afwachting: "In afwachting",
  bevestigd: "Bevestigd",
  wachtlijst: "Wachtlijst",
  afgewezen: "Afgewezen",
};

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  in_afwachting: "secondary",
  bevestigd: "default",
  wachtlijst: "outline",
  afgewezen: "destructive",
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<Registration[]>([]);
  const [fetching, setFetching] = useState(true);
  const [themaFilter, setThemaFilter] = useState<string>("all");
  const [sessieFilter, setSessieFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("in_afwachting");
  const [editNotitie, setEditNotitie] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    document.title = "Admin dashboard | Ronde Tafels";
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!isAdmin) {
      toast({ title: "Geen toegang", description: "Je hebt geen admin-rechten.", variant: "destructive" });
      return;
    }
    fetchRows();
  }, [user, isAdmin, loading, navigate]);

  const fetchRows = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    } else {
      setRows((data as Registration[]) || []);
    }
    setFetching(false);
  };

  const themas = useMemo(() => Array.from(new Set(rows.map((r) => r.thema))), [rows]);
  const sessies = useMemo(() => Array.from(new Set(rows.map((r) => r.moment))), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (themaFilter === "all" || r.thema === themaFilter) &&
          (sessieFilter === "all" || r.moment === sessieFilter) &&
          (statusFilter === "all" || r.status === statusFilter),
      ),
    [rows, themaFilter, sessieFilter, statusFilter],
  );

  const stats = useMemo(() => {
    const counts: Record<Status, number> = { in_afwachting: 0, bevestigd: 0, wachtlijst: 0, afgewezen: 0 };
    rows.forEach((r) => counts[r.status]++);
    return counts;
  }, [rows]);

  const openDetail = (r: Registration) => {
    setSelected(r);
    setEditStatus(r.status);
    setEditNotitie(r.notitie || "");
  };

  const saveDetail = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("registrations")
      .update({ status: editStatus, notitie: editNotitie })
      .eq("id", selected.id);
    if (error) {
      toast({ title: "Opslaan mislukt", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opgeslagen" });
      setSelected(null);
      fetchRows();
    }
  };

  const exportCSV = () => {
    const headers = ["Datum", "Voornaam", "Bedrijf", "Functie", "E-mail", "Telefoon", "Thema", "Sessie", "Status", "Toelichting", "Notitie"];
    const escape = (v: string | null) => `"${(v || "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        [
          new Date(r.created_at).toLocaleString("nl-BE"),
          r.voornaam, r.bedrijf, r.functie, r.email, r.telefoon, r.thema, r.moment,
          STATUS_LABEL[r.status], r.toelichting, r.notitie,
        ].map(escape).join(","),
      ),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inschrijvingen-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Laden…</div>;

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Geen toegang</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Dit account heeft geen admin-rechten.</p>
            <Button onClick={() => signOut().then(() => navigate("/auth"))} variant="outline" className="w-full">Uitloggen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-card border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Inschrijvingen</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/auth"))}>
            <LogOut className="mr-2 h-4 w-4" /> Uitloggen
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(stats) as Status[]).map((s) => (
            <Card key={s}>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</p>
                <p className="text-2xl font-bold">{stats[s]}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6 flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Thema</Label>
              <Select value={themaFilter} onValueChange={setThemaFilter}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle thema's</SelectItem>
                  {themas.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sessie</Label>
              <Select value={sessieFilter} onValueChange={setSessieFilter}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle sessies</SelectItem>
                  {sessies.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportCSV} variant="outline" className="ml-auto">
              <Download className="mr-2 h-4 w-4" /> Export CSV ({filtered.length})
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {fetching ? (
              <p className="text-sm text-muted-foreground">Laden…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen inschrijvingen gevonden.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Naam</TableHead>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>Thema</TableHead>
                    <TableHead>Sessie</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} onClick={() => openDetail(r)} className="cursor-pointer">
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("nl-BE")}
                      </TableCell>
                      <TableCell className="font-medium">{r.voornaam}</TableCell>
                      <TableCell>{r.bedrijf}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{r.thema}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">{r.moment}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.voornaam}</DialogTitle>
                <DialogDescription>{selected.bedrijf} — {selected.functie}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Detail label="E-mail" value={selected.email} />
                <Detail label="Telefoon" value={selected.telefoon || "—"} />
                <Detail label="Thema" value={selected.thema} />
                <Detail label="Sessie" value={selected.moment} />
                <Detail label="Toelichting" value={selected.toelichting || "—"} />
                <Detail label="Aangemeld op" value={new Date(selected.created_at).toLocaleString("nl-BE")} />

                <div className="space-y-1 pt-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Status)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Interne notitie</Label>
                  <Textarea value={editNotitie} onChange={(e) => setEditNotitie(e.target.value)} rows={3} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={saveDetail} className="flex-1 bg-[#315eff] hover:bg-[#315eff]/90">Opslaan</Button>
                  <Button onClick={() => setSelected(null)} variant="outline">Sluiten</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="col-span-2 break-words">{value}</span>
  </div>
);

export default Admin;
