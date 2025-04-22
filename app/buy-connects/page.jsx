"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

/* ───────────────────────────── constants ───────────────────────────── */
const BASE_URL = "http://localhost:5000";
const FIVERR_GREEN = "#1dbf73";
const FIVERR_BLACK = "#404145";
const CONNECT_PRICE = 0.5;                    // $0.50 / connect

/* ───────────────────────────── helpers ───────────────────────────── */
const money = (n) => `$${parseFloat(n).toFixed(2)}`;

/* ──────────────────────────── component ──────────────────────────── */
export default function ConnectsHistoryPage() {
  /* ───────── state ───────── */
  const { user } = useUser();
  const [freelancerId, setFreelancerId]   = useState(null);
  const [connectsBalance, setConnects]    = useState(null);
  const [userBalance, setUserBalance]     = useState(null);
  const [transactions, setTransactions]   = useState([]);

  const [purchaseQty, setPurchaseQty]     = useState(10);
  const [purchaseOpen, setPurchaseOpen]   = useState(false);
  const [buying, setBuying]               = useState(false);

  const [addFundsOpen, setAddFundsOpen]   = useState(false);
  const [addAmount, setAddAmount]         = useState("");
  const [addingFunds, setAddingFunds]     = useState(false);

  const [toast, setToast]                 = useState(null);          // {msg, type}

  /* ───────── initial fetches ───────── */
  useEffect(() => {
    if (user) {
      const email = user.emailAddresses[0].emailAddress;
      console.log(email);
      (async () => {
        try {
          const r = await fetch(`${BASE_URL}/api/getUserId`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const { userId } = await r.json();
          setFreelancerId(userId);
        } catch {
          console.error("Unable to fetch user id");
        }
      })();
    }
  }, [user]);

  /* ───────── data depending on freelancerId ───────── */
  useEffect(() => {
    if (!freelancerId) return;
    getConnects();
    getMoney();
    getHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freelancerId]);

  /* ───────── api calls ───────── */
  const getConnects = async () => {
    try {
      const r = await fetch(`${BASE_URL}/api/payments/connects?userId=${freelancerId}`);
      const d = await r.json();
      setConnects(d.balance);
    } catch { /* ignore */ }
  };

  const getMoney = async () => {
    try {
      const r = await fetch(`${BASE_URL}/api/balances?userId=${freelancerId}`);
      const d = await r.json();
      setUserBalance(parseFloat(d.available_amount));
    } catch { /* ignore */ }
  };

  const getHistory = async () => {
    try {
      const r = await fetch(`${BASE_URL}/api/payments/transactions?userId=${freelancerId}`);
      const d = await r.json();
      setTransactions(d);
    } catch { /* ignore */ }
  };

  /* ───────── purchase connects ───────── */
  const handlePurchase = async () => {
    const qty = parseInt(purchaseQty);
    if (!qty || qty < 1) return toastMsg("Enter a positive amount", "error");

    setBuying(true);
    try {
      const body = {
        userId: freelancerId,
        packageDetails: {
          amount: qty,
          price: qty * CONNECT_PRICE,
        },
      };
      const r = await fetch(`${BASE_URL}/api/payments/connects/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) {
        setConnects(d.connects.balance);
        getHistory();
        toastMsg(`Purchased ${qty} connects successfully!`);
        setPurchaseOpen(false);
      } else {
        toastMsg(d.message || "Purchase failed", "error");
      }
    } catch {
      toastMsg("Unexpected error – try again", "error");
    } finally {
      setBuying(false);
    }
  };

  /* ───────── add funds ───────── */
  const handleAddFunds = async () => {
    const amt = parseFloat(addAmount);
    if (!amt || amt <= 0) return toastMsg("Enter a positive amount", "error");

    setAddingFunds(true);
    try {
      const body = { userId: freelancerId, amount: amt };
      const r = await fetch(`${BASE_URL}/api/balances/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) {
        setUserBalance(parseFloat(d.balance.available_amount));
        toastMsg("Funds added!");
        setAddFundsOpen(false);
        setAddAmount("");
      } else {
        toastMsg(d.message || "Could not add funds", "error");
      }
    } catch {
      toastMsg("Unexpected error – try again", "error");
    } finally {
      setAddingFunds(false);
    }
  };

  /* ───────── toast helper ───────── */
  const toastMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ───────── row helpers ───────── */
  const signFor = (t) =>
    ["connect_purchase", "monthly_renewal", "job_cancelled"].includes(t)
      ? "+"
      : "-";

  const friendly = (t) =>
    ({
      connect_purchase: "Connects purchased",
      monthly_renewal: "Monthly renewal",
      job_application: "Applied to job",
      job_cancelled: "Job cancelled",
    }[t] || t);

  /* ──────────────────────────── render ──────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Connects History</h1>

        {userBalance !== null && (
          <Button
            type="button"
            disabled
            className="font-semibold cursor-default text-white"
            style={{ background: FIVERR_GREEN }}
          >
            Balance {money(userBalance)}
          </Button>
        )}
      </div>

      {/* connects balance + actions */}
      <Card className="p-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-gray-600 font-medium">My Connects</p>
            <h2 className="text-4xl font-bold text-black mt-1">
              {connectsBalance !== null ? connectsBalance : "--"} 
              <span className="text-sm font-medium text-gray-500">connects</span>
            </h2>
          </div>

          <div className="flex gap-4">
            {/* buy connects */}
            <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ background: FIVERR_GREEN }}
                  className="text-white font-semibold"
                >
                  Buy Connects
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Purchase Connects</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Number of connects
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={purchaseQty}
                      onChange={(e) => setPurchaseQty(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Cost: 
                      {money(parseInt(purchaseQty || 0) * CONNECT_PRICE)}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPurchaseOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ background: FIVERR_GREEN }}
                    className="text-white"
                    onClick={handlePurchase}
                    disabled={buying}
                  >
                    {buying ? "Processing…" : "Purchase"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* add funds */}
            <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ background: FIVERR_BLACK }}
                  className="text-white font-semibold"
                >
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Funds</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Amount in USD"
                    type="number"
                    min="1"
                    step="0.01"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddFundsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ background: FIVERR_BLACK }}
                    className="text-white"
                    onClick={handleAddFunds}
                    disabled={addingFunds}
                  >
                    {addingFunds ? "Adding…" : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* transactions table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Date
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Action / Details
              </th>
              <th className="py-3 px-4 text-right font-semibold text-gray-700">
                Connects
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const qty = JSON.parse(t.details)?.amount ?? 0;
              const sign = signFor(t.transaction_type);
              return (
                <tr
                  key={t.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 align-top text-gray-700">
                    {new Date(t.transaction_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 align-top text-gray-700">
                    <p>{friendly(t.transaction_type)}</p>
                    {t.job_id && (
                      <p className="text-gray-500">
                        Job #<span>{t.job_id}</span>
                      </p>
                    )}
                  </td>
                  <td
                    className={`py-3 px-4 text-right align-top font-medium ${
                      sign === "+" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {sign}
                    {Math.abs(qty)}
                  </td>
                </tr>
              );
            })}
            {!transactions.length && (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 px-4 text-center text-gray-500"
                >
                  No transactions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 flex items-center gap-3 px-4 py-2 rounded shadow-lg text-white ${
            toast.type === "error" ? "bg-red-500" : "bg-green-600"
          }`}
        >
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}