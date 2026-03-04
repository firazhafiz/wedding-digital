"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
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
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Login gagal");
        return;
      }

      toast.success("Login berhasil");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-off-white mb-2">
            Admin Panel
          </h1>
          <p className="font-body text-sm text-white/40 tracking-wider">
            Wedding Dashboard
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-charcoal/50 border border-white/5 rounded-lg p-8 space-y-6 backdrop-blur-sm"
        >
          <div>
            <label
              htmlFor="email"
              className="block font-body text-xs tracking-[0.15em] uppercase text-white/40 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 bg-charcoal-dark/60 border border-white/10 rounded-md text-off-white font-body placeholder:text-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-body text-xs tracking-[0.15em] uppercase text-white/40 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-charcoal-dark/60 border border-white/10 rounded-md text-off-white font-body placeholder:text-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Masuk
          </Button>
        </form>

        <p className="text-center mt-6 font-body text-xs text-white/20">
          Hanya untuk pengantin & pengelola
        </p>
      </div>
    </div>
  );
}
