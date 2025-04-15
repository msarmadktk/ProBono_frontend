// pages/connects-history.js
'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { Check, AlertCircle } from 'lucide-react';

export default function ConnectsHistoryPage() {
  const [connectsBalance, setConnectsBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchConnectsBalance();
    fetchTransactionHistory();
  }, []);

  const fetchConnectsBalance = async () => {
    try {
      const response = await fetch('/api/payments/connects');
      if (response.ok) {
        const data = await response.json();
        setConnectsBalance(data);
      } else {
        console.error('Failed to fetch connects balance');
      }
    } catch (error) {
      console.error('Error fetching connects balance:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch('/api/payments/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Failed to fetch transaction history');
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/connects/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(purchaseAmount),
          payment_method: paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectsBalance(data.connects);
        fetchTransactionHistory();
        toast({
          title: "Purchase Successful",
          description: `You have successfully purchased ${purchaseAmount} connects.`,
          action: <Check className="h-4 w-4 text-green-500" />,
        });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Purchase Failed",
          description: "There was an error processing your purchase.",
          action: <AlertCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      console.error('Error purchasing connects:', error);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
        action: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for display
  const mockData = [
    { date: 'Mar 6, 2025', action: 'Monthly renewal', connects: '+10' },
    { 
      date: 'Feb 14, 2024', 
      action: 'Applied to job', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '-21' 
    },
    { 
      date: 'Sep 13, 2023', 
      action: 'Job Cancelled', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '+7' 
    },
    { date: 'Mar 6, 2025', action: 'Connects purchased', connects: '+100' },
    { 
      date: 'Feb 14, 2024', 
      action: 'Applied to job', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '-21' 
    },
    { 
      date: 'Sep 13, 2023', 
      action: 'Job Cancelled', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '+7' 
    },
    { 
      date: 'Feb 14, 2024', 
      action: 'Applied to job', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '-21' 
    },
    { 
      date: 'Sep 13, 2023', 
      action: 'Job Cancelled', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '+7' 
    },
    { date: 'Mar 6, 2025', action: 'Monthly renewal', connects: '+10' },
    { 
      date: 'Feb 14, 2024', 
      action: 'Applied to job', 
      description: 'Assistance needed for setting up a project using Vite and Tailwind Css',
      connects: '-21' 
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Connects History</h1>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-gray-600 font-medium">My Balance</p>
            <h2 className="text-4xl font-bold mt-1">69 connects</h2>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md">
                Buy Connects
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Purchase Connects</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount of Connects</label>
                  <Input
                    type="number"
                    min="1"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePurchase} 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Processing..." : "Purchase"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Connects</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 text-gray-700 align-top">{item.date}</td>
                <td className="py-4 px-4 text-gray-700 align-top">
                  <div>{item.action}</div>
                  {item.description && (
                    <div className="text-gray-500 mt-1">{item.description}</div>
                  )}
                </td>
                <td className={`py-4 px-4 text-right font-medium align-top ${
                  item.connects.startsWith('+') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {item.connects}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}

// API Routes

// pages/api/payments/connects.js
export async function getConnectsBalance(req, res) {
  if (req.method === 'GET') {
    try {
      // In a real application, you would fetch this data from your database
      const connectsData = {
        id: 1,
        user_id: 1,
        balance: 69,
        last_updated: new Date().toISOString(),
      };
      
      return res.status(200).json(connectsData);
    } catch (error) {
      console.error('Error fetching connects balance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// pages/api/payments/connects/purchase.js
export async function purchaseConnects(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, payment_method } = req.body;
      
      if (!amount || !payment_method) {
        return res.status(400).json({ error: 'Amount and payment method are required' });
      }
      
      // In a real application, you would process the payment and update the database
      const updatedConnects = {
        id: 1,
        user_id: 1,
        balance: 69 + parseInt(amount),
        last_updated: new Date().toISOString(),
      };
      
      const transaction = {
        id: Math.floor(Math.random() * 1000),
        user_id: 1,
        transaction_type: 'connect_purchase',
        amount: parseFloat(amount),
        transaction_date: new Date().toISOString(),
        details: `Purchase of ${amount} connects`,
      };
      
      return res.status(200).json({
        message: 'Connects purchased successfully',
        connects: updatedConnects,
        transaction,
      });
    } catch (error) {
      console.error('Error purchasing connects:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// pages/api/payments/transactions.js
export async function getTransactionHistory(req, res) {
  if (req.method === 'GET') {
    try {
      const { transaction_type, startDate, endDate } = req.query;
      
      // In a real application, you would fetch this data from your database with filters
      const transactions = [
        {
          id: 1,
          user_id: 1,
          transaction_type: 'connect_purchase',
          amount: 100.00,
          transaction_date: '2025-03-06T12:00:00.000Z',
          details: 'Purchase of 100 connects',
        },
        {
          id: 2,
          user_id: 1,
          transaction_type: 'monthly_renewal',
          amount: 10.00,
          transaction_date: '2025-03-06T12:00:00.000Z',
          details: 'Monthly renewal: 10 connects',
        },
        {
          id: 3,
          user_id: 1,
          transaction_type: 'job_application',
          amount: -21.00,
          transaction_date: '2024-02-14T12:00:00.000Z',
          details: 'Applied to job: Assistance needed for setting up a project using Vite and Tailwind Css',
        },
        {
          id: 4,
          user_id: 1,
          transaction_type: 'job_cancelled',
          amount: 7.00,
          transaction_date: '2023-09-13T12:00:00.000Z',
          details: 'Job cancelled: Assistance needed for setting up a project using Vite and Tailwind Css',
        },
      ];
      
      // Filter transactions by type if specified
      let filteredTransactions = transactions;
      if (transaction_type) {
        filteredTransactions = filteredTransactions.filter(t => t.transaction_type === transaction_type);
      }
      
      // Filter by date range if specified
      if (startDate) {
        const start = new Date(startDate);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.transaction_date) >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.transaction_date) <= end);
      }
      
      return res.status(200).json(filteredTransactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}