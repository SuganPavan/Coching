"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap, Loader2, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Validates that a callbackUrl is a safe relative path on this origin,
// preventing open redirect attacks via a crafted ?callbackUrl= query param.
function getSafeCallbackUrl(raw: string | null): string {
  if (!raw) return "/admin/dashboard";
  try {
    // If it parses as an absolute URL with a different origin, reject it
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/admin/dashboard";
    return url.pathname;
  } catch {
    // Not a valid URL at all — treat as a plain relative path
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/admin/dashboard";
  }
}

function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) { setErrorMsg("Please enter your email address."); return; }
    if (!password) { setErrorMsg("Please enter your password."); return; }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setErrorMsg("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Hard navigation: gives the browser time to commit the session cookie
      // before the next page loads. router.push() can race the cookie write
      // and trigger a middleware redirect loop back to /login.
      const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
      window.location.href = callbackUrl;
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          {/* Header */}
          <div className="border-b border-border px-8 py-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy-600 text-white shadow-md">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-navy-700">Admin Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Bright Future Academy</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {/* Inline error banner */}
            {errorMsg && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@brightfuture.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                    disabled={loading}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  <><ShieldCheck className="h-4 w-4" /> Sign in to Admin Panel</>
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-8 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Default credentials after seeding:{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[11px]">
                admin@brightfuture.com
              </code>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-navy-600">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
