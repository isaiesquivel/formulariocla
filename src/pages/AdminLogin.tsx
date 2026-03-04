import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_auth");
    if (stored === "true") navigate("/admin/panel", { replace: true });
  }, [navigate]);

  const handleLogin = () => {
    if (user === "admin" && pass === "becas2627") {
      sessionStorage.setItem("admin_auth", "true");
      navigate("/admin/panel");
    } else {
      toast({ title: "Credenciales incorrectas", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-xl shadow-lg p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Panel de Administración</h2>
          <p className="text-sm text-muted-foreground">Ingrese sus credenciales</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Usuario</Label>
            <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Usuario" />
          </div>
          <div className="space-y-1.5">
            <Label>Contraseña</Label>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Contraseña"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <Button className="w-full" onClick={handleLogin}>Iniciar Sesión</Button>
        </div>
      </div>
    </div>
  );
}
