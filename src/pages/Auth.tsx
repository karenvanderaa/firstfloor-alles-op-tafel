import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Admin login | Ronde Tafels";
    if (!loading && user) navigate("/admin", { replace: true });
  }, [user, loading, navigate]);

  const handle = async (mode: "signin" | "signup") => {
    setSubmitting(true);
    const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "Er ging iets mis", description: error.message, variant: "destructive" });
    } else if (mode === "signup") {
      toast({ title: "Account aangemaakt", description: "Je kan nu inloggen." });
    } else {
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading">Admin toegang</CardTitle>
          <CardDescription>Login om de inschrijvingen te bekijken.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signin">Inloggen</TabsTrigger>
              <TabsTrigger value="signup">Account aanmaken</TabsTrigger>
            </TabsList>
            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`email-${mode}`}>E-mail</Label>
                  <Input id={`email-${mode}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`pw-${mode}`}>Wachtwoord</Label>
                  <Input id={`pw-${mode}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                <Button onClick={() => handle(mode)} disabled={submitting || !email || !password} className="w-full bg-[#315eff] hover:bg-[#315eff]/90">
                  {submitting ? "Bezig…" : mode === "signin" ? "Inloggen" : "Account aanmaken"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
