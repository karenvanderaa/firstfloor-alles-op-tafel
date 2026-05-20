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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, LogOut, RefreshCw } from "lucide-react";

type Status = "in_afwachting" | "bevestigd" | "wachtlijst" | "afgewezen" | "geannuleerd";

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
  brevo_synced_at: string | null;
  brevo_last_error: string | null;
  brevo_attempts: number;
}

interface Subscriber {
  id: string;
  email: string;
  voornaam: string | null;
  achternaam: string | null;
  created_at: string;
  brevo_synced_at: string | null;
  brevo_last_error: string | null;
  brevo_attempts: number;
}

const STATUS_LABEL: Record<Status, string> = {
  in_afwachting: "In afwachting",
  bevestigd: "Bevestigd",
  wachtlijst: "Wachtlijst",
  afgewezen: "Afgewezen",
  geannuleerd: "Geannuleerd",
};

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  in_afwachting: "secondary",
  bevestigd: "default",
  wachtlijst: "outline",
  afgewezen: "destructive",
  geannuleerd: "destructive",
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<Registration[]>([]);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [fetching, setFetching] = useState(true);
  const [themaFilter, setThemaFilter] = useState<string>("all");
  const [sessieFilter, setSessieFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("in_afwachting");
  const [editNotitie, setEditNotitie] = useState("");
  const [editVoornaam, setEditVoornaam] = useState("");
  const [editBedrijf, setEditBedrijf] = useState("");
  const [editFunctie, setEditFunctie] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefoon, setEditTelefoon] = useState("");
  const [editThema, setEditThema] = useState("");
  const [editMoment, setEditMoment] = useState("");
  const [editToelichting, setEditToelichting] = useState("");
  const [saving, setSaving] = useState(false);
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
    const [regRes, subRes] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
    ]);
    if (regRes.error) toast({ title: "Fout", description: regRes.error.message, variant: "destructive" });
    else setRows((regRes.data as Registration[]) || []);
    if (subRes.error) toast({ title: "Fout abonnees", description: subRes.error.message, variant: "destructive" });
    else setSubs((subRes.data as Subscriber[]) || []);
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
    const counts: Record<Status, number> = { in_afwachting: 0, bevestigd: 0, wachtlijst: 0, afgewezen: 0, geannuleerd: 0 };
    rows.forEach((r) => counts[r.status]++);
    return counts;
  }, [rows]);

  const openDetail = (r: Registration) => {
    setSelected(r);
    setEditStatus(r.status);
    setEditNotitie(r.notitie || "");
    setEditVoornaam(r.voornaam || "");
    setEditBedrijf(r.bedrijf || "");
    setEditFunctie(r.functie || "");
    setEditEmail(r.email || "");
    setEditTelefoon(r.telefoon || "");
    setEditThema(r.thema || "");
    setEditMoment(r.moment || "");
    setEditToelichting(r.toelichting || "");
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("registrations")
      .update({
        status: editStatus,
        notitie: editNotitie,
        voornaam: editVoornaam.trim(),
        bedrijf: editBedrijf.trim(),
        functie: editFunctie.trim(),
        email: editEmail.trim(),
        telefoon: editTelefoon.trim() || null,
        thema: editThema.trim(),
        moment: editMoment.trim(),
        toelichting: editToelichting.trim() || null,
      })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast({ title: "Opslaan mislukt", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opgeslagen" });
      setSelected(null);
      fetchRows();
    }
  };

  const deleteRegistration = async () => {
    if (!selected) return;
    if (!confirm(`Inschrijving van ${selected.voornaam} verwijderen?`)) return;
    const { error } = await supabase.from("registrations").delete().eq("id", selected.id);
    if (error) {
      toast({ title: "Verwijderen mislukt", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verwijderd" });
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

  const exportSubsCSV = () => {
    const headers = ["Datum", "Voornaam", "Achternaam", "E-mail"];
    const escape = (v: string | null) => `"${(v || "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...subs.map((s) =>
        [new Date(s.created_at).toLocaleString("nl-BE"), s.voornaam, s.achternaam, s.email].map(escape).join(","),
      ),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromBrevo = async () => {
    setImporting(true);
    const { data, error } = await supabase.functions.invoke("brevo-import");
    setImporting(false);
    if (error) {
      toast({ title: "Import mislukt", description: error.message, variant: "destructive" });
      return;
    }
    const reg = data?.registrations || {};
    const sub = data?.subscribers || {};
    const skippedCount = Array.isArray(reg.skipped) ? reg.skipped.length : 0;
    toast({
      title: "Brevo import voltooid",
      description: `Inschrijvingen: ${reg.imported || 0} nieuw · ${reg.updated || 0} aangevuld · ${skippedCount} overgeslagen. Abonnees: ${sub.imported || 0} nieuw · ${sub.updated || 0} aangevuld.`,
    });
    if (skippedCount > 0) console.log("Overgeslagen inschrijvingen:", reg.skipped);
    if (reg.errors?.length) console.log("Reg errors:", reg.errors);
    if (sub.errors?.length) console.log("Sub errors:", sub.errors);
    fetchRows();
  };

  const resyncBrevo = async (table: "registrations" | "subscribers", id: string) => {
    toast({ title: "Brevo-sync gestart…" });
    const { data, error } = await supabase.functions.invoke("sync-to-brevo", {
      body: { table, id },
    });
    if (error || data?.error) {
      toast({
        title: "Brevo-sync mislukt",
        description: error?.message || data?.error || "Onbekende fout",
        variant: "destructive",
      });
    } else {
      toast({ title: "Brevo-sync gelukt" });
    }
    fetchRows();
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
        {/* Global actions */}
        <div className="flex justify-end">
          <Button onClick={importFromBrevo} variant="outline" disabled={importing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${importing ? "animate-spin" : ""}`} />
            {importing ? "Importeren uit Brevo…" : "Importeer uit Brevo"}
          </Button>
        </div>

        <Tabs defaultValue="inschrijvingen" className="space-y-6">
          <TabsList>
            <TabsTrigger value="inschrijvingen">Inschrijvingen ({rows.length})</TabsTrigger>
            <TabsTrigger value="abonnees">Op de hoogte ({subs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="inschrijvingen" className="space-y-6">
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
                        <TableHead>Brevo</TableHead>
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
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <BrevoSyncCell
                              syncedAt={r.brevo_synced_at}
                              error={r.brevo_last_error}
                              onResync={() => resyncBrevo("registrations", r.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abonnees" className="space-y-6">
            <Card>
              <CardContent className="pt-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Mensen die zich aanmeldden voor updates ("Houd me op de hoogte").
                </p>
                <Button onClick={() => exportSubsCSV()} variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export CSV ({subs.length})
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {fetching ? (
                  <p className="text-sm text-muted-foreground">Laden…</p>
                ) : subs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nog geen abonnees.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Voornaam</TableHead>
                        <TableHead>Achternaam</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Brevo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subs.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(s.created_at).toLocaleDateString("nl-BE")}
                          </TableCell>
                          <TableCell>{s.voornaam || "—"}</TableCell>
                          <TableCell>{s.achternaam || "—"}</TableCell>
                          <TableCell className="font-medium">{s.email}</TableCell>
                          <TableCell>
                            <BrevoSyncCell
                              syncedAt={s.brevo_synced_at}
                              error={s.brevo_last_error}
                              onResync={() => resyncBrevo("subscribers", s.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Inschrijving bewerken</DialogTitle>
                <DialogDescription>
                  Aangemeld op {new Date(selected.created_at).toLocaleString("nl-BE")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Voornaam / Naam</Label>
                    <Input value={editVoornaam} onChange={(e) => setEditVoornaam(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Bedrijf</Label>
                    <Input value={editBedrijf} onChange={(e) => setEditBedrijf(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Functie</Label>
                  <Input value={editFunctie} onChange={(e) => setEditFunctie(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>E-mail</Label>
                    <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefoon</Label>
                    <Input value={editTelefoon} onChange={(e) => setEditTelefoon(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Thema</Label>
                    <Input value={editThema} onChange={(e) => setEditThema(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Sessie / Moment</Label>
                    <Input value={editMoment} onChange={(e) => setEditMoment(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Toelichting</Label>
                  <Textarea value={editToelichting} onChange={(e) => setEditToelichting(e.target.value)} rows={2} />
                </div>

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

                <div className="space-y-2 pt-2 border-t border-border">
                  <Label>Brevo-synchronisatie</Label>
                  <div className="flex items-center gap-3 text-xs">
                    <BrevoSyncCell
                      syncedAt={selected.brevo_synced_at}
                      error={selected.brevo_last_error}
                      onResync={() => resyncBrevo("registrations", selected.id)}
                    />
                    <span className="text-muted-foreground">
                      {selected.brevo_attempts || 0} poging(en)
                    </span>
                  </div>
                  {selected.brevo_last_error && (
                    <p className="text-xs text-destructive break-all">{selected.brevo_last_error}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={saveDetail} disabled={saving} className="flex-1 bg-[#315eff] hover:bg-[#315eff]/90">
                    {saving ? "Opslaan…" : "Opslaan"}
                  </Button>
                  <Button onClick={() => setSelected(null)} variant="outline">Sluiten</Button>
                  <Button onClick={deleteRegistration} variant="destructive">Verwijderen</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function BrevoSyncCell({
  syncedAt,
  error,
  onResync,
}: {
  syncedAt: string | null;
  error: string | null;
  onResync: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    await onResync();
    setBusy(false);
  };
  if (syncedAt) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          ✓ Gesynct
        </Badge>
        <Button size="sm" variant="ghost" onClick={handle} disabled={busy} className="h-7 px-2">
          <RefreshCw className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} />
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Badge variant={error ? "destructive" : "secondary"}>
        {error ? "Fout" : "Wachten…"}
      </Badge>
      <Button size="sm" variant="outline" onClick={handle} disabled={busy} className="h-7 px-2 text-xs">
        <RefreshCw className={`mr-1 h-3 w-3 ${busy ? "animate-spin" : ""}`} />
        Resync
      </Button>
    </div>
  );
}

export default Admin;
