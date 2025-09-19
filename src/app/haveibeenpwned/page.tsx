"use client";

import { useState } from "react";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Page() {
  type LeakCheckSuccess = {
    success: true;
    found: number;
    fields: string[];
    sources: { name: string; date: string }[];
  };
  type LeakCheckError = {
    success: false;
    error: string;
  };
  type LeakCheckResult = LeakCheckSuccess | LeakCheckError;
  const [data, setData] = useState<LeakCheckResult | null>(null);
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isValidEmail(value: string) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function getData(targetEmail: string) {
    try {
      setLoading(true);
      setError(null);
      const normalized = targetEmail.trim().replace(/^\/+/, "");
      const res = await fetch(`/api/checkpwnd/${encodeURIComponent(normalized)}`);
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const json: LeakCheckResult = await res.json();
      setData(json);
      console.log("pwned result", json);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      console.error(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Please accept the terms and conditions.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    const clean = email.trim().replace(/^\/+/, "");
    void getData(clean);
  }
  return(
    <>
      <AppNavigation className="mt-3 ml-4" />

      <Dialog>
        <div className="flex justify-center p-4 mt-120">
          <DialogTrigger asChild>
            <ShimmerButton
              type="button"
              className="shadow-2xl mt-10 flex h-16 w-full max-w-lg items-center justify-center"
            >
              Check if your email has been pwned
            </ShimmerButton>
          </DialogTrigger>
        </div>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Check if your email has been pwned</DialogTitle>
              <DialogDescription>
                Enter your email address below to see if it has been compromised in a data breach.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {error && (
                <p className="text-red-500 text-sm" role="alert">{error}</p>
              )}
              <div className="grid gap-3">
                <Label htmlFor="mail-1">Email</Label>
                <input
                  id="mail-1"
                  name="mail"   
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@tuturis.com"
                  className="bg-background border-input ring-offset-background file:text-foreground placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                {email && !isValidEmail(email) && (
                  <p className="text-red-500 text-xs">Invalid email format.</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} />
                <Label htmlFor="terms">
                  Accept <Link href="/terms" className="underline">terms and conditions</Link>
                </Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button type="button" className="border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md border bg-transparent px-3 text-sm font-medium">Cancel</button>
              </DialogClose>
              <button
                type="submit"
                disabled={!termsAccepted || !email || !isValidEmail(email) || loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-9 rounded-md px-3 text-sm font-medium"
              >
                {loading ? "Checking..." : "Check if pwned"}
              </button>
            </DialogFooter>
            {data !== null && (
              <div className="mt-4 rounded-md bg-muted p-3 text-sm max-h-60 overflow-auto space-y-2">
                {data.success === false ? (
                  <p className="text-red-500">{data.error || "No results found."}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">Breaches found: <span className="font-semibold">{data.found}</span></p>
                    {data.fields?.length > 0 && (
                      <div>
                        <p className="font-medium">Fields:</p>
                        <ul className="list-disc ml-5">
                          {data.fields.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.sources?.length > 0 && (
                      <div>
                        <p className="font-medium">Sources:</p>
                        <ul className="list-disc ml-5">
                          {data.sources.map((s, i) => (
                            <li key={`${s.name}-${i}`}>
                              <span className="font-medium">{s.name}</span>
                              {s.date ? <span className="text-muted-foreground"> — {s.date}</span> : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  ) 
  
}
