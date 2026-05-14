import { useState } from "react";
import { Building2, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useAuth } from "../../contexts/AuthContext";
import type { SocialProvider } from "../../types";

export function LoginPage() {
  const { login, loginWithSocial, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setError(null);
    try {
      await loginWithSocial(provider);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-semibold tracking-tight">EquipMap</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Plataforma de Gestão Predial e Patrimonial
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Controle equipamentos, patrimônio, manutenções e garantias em um único lugar.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Equipamentos", value: "2.4k+" },
              { label: "Condomínios", value: "180+" },
              { label: "Manutenções", value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold">EquipMap</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Bem-vindo de volta</h2>
              <p className="text-gray-500 mt-1">Acesse sua conta para continuar</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full flex items-center gap-3 h-11"
                disabled={isLoading}
                onClick={() => handleSocialLogin("google")}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                <span>Continuar com Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-3 h-11"
                disabled={isLoading}
                onClick={() => handleSocialLogin("microsoft")}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MicrosoftIcon />}
                <span>Continuar com Microsoft</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Separator className="flex-1" />
              <span className="text-sm text-gray-400">ou</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-700">
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Entrar
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Não tem uma conta?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Solicitar acesso
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="0" y="0" width="8.5" height="8.5" fill="#F35325"/>
      <rect x="9.5" y="0" width="8.5" height="8.5" fill="#81BC06"/>
      <rect x="0" y="9.5" width="8.5" height="8.5" fill="#05A6F0"/>
      <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFBA08"/>
    </svg>
  );
}
