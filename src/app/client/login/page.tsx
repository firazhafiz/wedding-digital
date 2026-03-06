"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login gagal");
        return;
      }

      toast.success("Login berhasil!");
      router.push("/client");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-off-white mb-2">
            Client Portal
          </h1>
          <p className="font-body text-sm text-white/40 tracking-wider">
            Kelola Event Anda
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6 backdrop-blur-sm"
        >
          <div>
            <label
              htmlFor="client-email"
              className="block font-body text-xs tracking-[0.15em] uppercase text-white/40 mb-2"
            >
              Email
            </label>
            <input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-off-white font-body placeholder:text-white/20 focus:outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="client-password"
              className="block font-body text-xs tracking-[0.15em] uppercase text-white/40 mb-2"
            >
              Password
            </label>
            <input
              id="client-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-off-white font-body placeholder:text-white/20 focus:outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full bg-blue-600! hover:bg-blue-700! hover:shadow-none! shadow-none!"
          >
            Masuk
          </Button>
        </form>

        <p className="text-center mt-6 font-body text-xs text-white/20">
          Hubungi pengelola jika belum memiliki akses
        </p>
      </div>
    </div>
  );
}
