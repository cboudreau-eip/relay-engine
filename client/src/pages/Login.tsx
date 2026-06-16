import { Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const login = trpc.auth.login.useMutation({
    onSuccess: () => navigate("/"),
    onError: () => setError("Incorrect password. Try again."),
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#FDF0E9" }}
    >
      <div className="bg-white border-[2.5px] border-[#1a1a1a] rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 bg-[#C8F5E0] border-2 border-[#1a1a1a] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-extrabold uppercase tracking-tight">
            Relay Engine
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            login.mutate({ password });
          }}
        >
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-blue-500 transition-colors"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={login.isPending || !password}
            className="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#333] disabled:opacity-50 transition-colors"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
