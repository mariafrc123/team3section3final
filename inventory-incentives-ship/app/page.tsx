"use client";
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Trophy, Target } from "lucide-react";

// -------------------- Utils --------------------
const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmtCurrency = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Number(n || 0));

// Default season: current year summer (Jun 1 -> Aug 31)
const y = new Date().getFullYear();
const DEFAULT_SEASON = { start: `${y}-06-01`, end: `${y}-08-31` };

// Brand color (Vivint dark)
const BRAND = "#282a3b";

// Standardized loss reasons
const LOSS_REASONS = ["Stolen", "Damaged", "Misplaced", "Expired/Obsolete", "Installer Error", "Other"];

// -------------------- Local Storage --------------------
const LS_KEYS = { employees: "inv_employees_v2", txns: "inv_txns_v2", season: "inv_season_v2" };
const lsGet = (k, f) => { try { if (typeof localStorage === "undefined") return f; const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; } };
const lsSet = (k, v) => { try { if (typeof localStorage === "undefined") return; localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// -------------------- Seed Data --------------------
const seedEmployees = [
  { id: uuid(), name: "Jordan Kim", role: "Installer", empType: "Full-time", team: "Alpha", region: "East" },
  { id: uuid(), name: "Taylor Brooks", role: "Installer", empType: "Full-time", team: "Alpha", region: "West" },
  { id: uuid(), name: "Riley Gomez", role: "Installer", empType: "Full-time", team: "Alpha", region: "South" },
  { id: uuid(), name: "Casey Morgan", role: "Installer", empType: "Full-time", team: "Alpha", region: "North" },
  { id: uuid(), name: "Avery Chen", role: "Installer", empType: "Full-time", team: "Alpha", region: "West" },
  { id: uuid(), name: "Peyton Diaz", role: "Installer", empType: "Summer", team: "Bravo", region: "East" },
  { id: uuid(), name: "Quinn Patel", role: "Installer", empType: "Summer", team: "Bravo", region: "West" },
  { id: uuid(), name: "Drew Allen", role: "Installer", empType: "Summer", team: "Bravo", region: "South" },
  { id: uuid(), name: "Skylar Nguyen", role: "Installer", empType: "Summer", team: "Bravo", region: "North" },
  { id: uuid(), name: "Emerson Lee", role: "Installer", empType: "Summer", team: "Bravo", region: "East" },
];

const seedTxns = [];
const DEMO_MODE = true;

export default function InventoryUsageTracker() {
  const [employees, setEmployees] = useState(() => lsGet(LS_KEYS.employees, seedEmployees));
  const [txns, setTxns] = useState(() => lsGet(LS_KEYS.txns, seedTxns));
  const [season, setSeason] = useState(() => lsGet(LS_KEYS.season, DEFAULT_SEASON));

  useEffect(() => { lsSet(LS_KEYS.employees, employees); }, [employees]);
  useEffect(() => { lsSet(LS_KEYS.txns, txns); }, [txns]);
  useEffect(() => { lsSet(LS_KEYS.season, season); }, [season]);

  useEffect(() => { if (DEMO_MODE && employees.length < 10) setEmployees(seedEmployees); }, [employees]);

  const installerLeaderboard = useMemo(() => {
    const installers = employees.filter(e => (e.role || "").toLowerCase() === "installer");

    if (DEMO_MODE) {
      const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const reasons = LOSS_REASONS.filter(r => r !== "Other");

      const perEmp = installers
        .map(emp => {
          const installs = randInt(35, 120);
          const onHand = Math.round(installs * 1.5);
          const losses = randInt(0, Math.max(0, Math.floor(installs * 0.2)));
          const avgUnitCost = randInt(40, 250);
          const lossValue = losses * avgUnitCost;
          const lossReason = reasons.length ? pick(reasons) : "Damaged";
          const progressPercent = randInt(35, 100);
          return { emp, installs, onHand, losses, lossValue, lossReason, progressPercent };
        })
        .sort((a, b) => a.lossValue - b.lossValue);

      return { perEmp };
    }

    return { perEmp: [] };
  }, [employees]);

  // Runtime self-tests
  useEffect(() => {
    console.assert(Array.isArray(installerLeaderboard.perEmp), "perEmp should be an array");
    console.assert(installerLeaderboard.perEmp.length >= 10, "Expected at least 10 installers in demo mode");
    const s = installerLeaderboard.perEmp[0];
    if (s) console.assert(s.onHand === Math.round(s.installs * 1.5), "onHand must be 1.5x installs (rounded)");
    const arr = installerLeaderboard.perEmp.map(x => x.lossValue);
    const sorted = [...arr].sort((a,b)=>a-b);
    console.assert(JSON.stringify(arr) === JSON.stringify(sorted), "Rows must be sorted by Loss $ ascending");
  }, [installerLeaderboard]);

  function resetDemo() {
    setEmployees(seedEmployees);
    setTxns([]);
    toast.success("Demo data reset: 10 installers loaded");
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 space-y-6">
      <header className="flex items-center justify-between" style={{ background: BRAND, color: "white", borderRadius: "16px", padding: "16px" }}>
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Inventory Usage & Incentives Tracker</h1>
        </div>
        <Button className="bg-white text-[#282a3b] hover:bg-gray-100" onClick={resetDemo}>Reset Demo Data</Button>
      </header>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full border rounded-2xl">
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#282a3b] data-[state=active]:text-white">Statistics</TabsTrigger>
          <TabsTrigger value="incentives" className="data-[state=active]:bg-[#282a3b] data-[state=active]:text-white">Incentives</TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Trophy className="w-5 h-5"/><h3 className="text-lg font-semibold">Installer Statistics</h3></div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Season</label>
                  <Input type="date" value={season.start} onChange={e=>setSeason(s=>({ ...s, start: e.target.value }))} />
                  <span>-</span>
                  <Input type="date" value={season.end} onChange={e=>setSeason(s=>({ ...s, end: e.target.value }))} />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Installs</th>
                      <th className="p-3">On-hand</th>
                      <th className="p-3">Losses</th>
                      <th className="p-3">Loss $</th>
                      <th className="p-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installerLeaderboard.perEmp.map((r, index) => {
                      return (
                        <tr key={r.emp.id} className="border-t">
                          <td className="p-3 font-semibold">{index + 1}</td>
                          <td className="p-3 font-medium text-base">{r.emp.name} {r.emp.empType === 'Summer' && (<Badge>Summer</Badge>)}</td>
                          <td className="p-3">{r.installs}</td>
                          <td className="p-3">{r.onHand}</td>
                          <td className="p-3">{r.losses}</td>
                          <td className="p-3">{fmtCurrency(r.lossValue)}</td>
                          <td className="p-3">{r.lossReason || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incentives Tab */}
        <TabsContent value="incentives" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Target className="w-5 h-5"/><h3 className="text-lg font-semibold">Installer Incentive Progress</h3></div>
              <div className="space-y-3">
                {installerLeaderboard.perEmp.map(r => (
                  <div key={r.emp.id} className="flex items-center justify-between border-b pb-2">
                    <div className="text-lg font-medium w-1/3">{r.emp.name}</div>
                    <div className="flex-1 pl-4"><ProgressBar value={r.progressPercent} large /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProgressBar({ value, large }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const height = large ? "h-4" : "h-2";
  return (
    <div className={`${height} w-full rounded-full bg-gray-200 overflow-hidden`}>
      <div className="h-full transition-all duration-300" style={{ width: `${v}%`, background: BRAND }} />
    </div>
  );
}
