"use client";

import { useState } from "react";

export default function Page() {
  const [formData, setFormData] = useState({
    amount: "",
    sender_prev_bal: "",
    receiver_prev_bal: "",
    type: "CASH_OUT",
  });

  const [prediction, setPrediction] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let newValue: string | number = value;

    if (type === "number") {
      const numericValue = parseFloat(value);
      newValue = isNaN(numericValue) || numericValue < 0 ? 0 : numericValue;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setError(null);

    if (formData.amount > formData.sender_prev_bal) {
      setLoading(false);
      setError("Transaction amount cannot be more than sender balance")
      return
    }

    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (process.env.NODE_ENV === "development") {
        API_URL = "http://localhost:3000";
      }

      const res = await fetch(`${API_URL}/api/py/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          sender_prev_bal: parseFloat(formData.sender_prev_bal),
          receiver_prev_bal: parseFloat(formData.receiver_prev_bal),
          type: formData.type,
        }),
      });


      const data = await res.json();

      if (data) {
        setPrediction(data);
      } else {
        setError("No prediction returned");
      }
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError("Error fetching prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-6 font-sans">
      <header className="w-full max-w-md bg-white text-gray-900 p-6 rounded-2xl shadow-xl mb-8 border border-gray-100 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Fraud Detection</h1>
        <p className="text-gray-600 text-sm font-medium">Analyze transaction details with precision</p>
      </header>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="number"
            name="amount"
            placeholder="Transaction Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-200"
            required
          />
          <input
            type="number"
            name="sender_prev_bal"
            placeholder="Sender's Previous Balance"
            value={formData.sender_prev_bal}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-200"
            required
          />
          <input
            type="number"
            name="receiver_prev_bal"
            placeholder="Receiver's Previous Balance"
            value={formData.receiver_prev_bal}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-200"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
            title="Transaction Type"
          >
            <option value="CASH_IN">Deposit</option>
            <option value="CASH_OUT">Withdrawal</option>
            <option value="DEBIT">Debit</option>
            <option value="PAYMENT">Payment</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Analyzing...' : 'Analyze Transaction'}
          </button>
        </form>

        {error && (
          <p className="mt-6 p-4 bg-red-50 text-red-800 border border-red-100 rounded-xl font-medium">
            {error}
          </p>
        )}

        {prediction && (() => {
          const data = typeof prediction === 'string' ? JSON.parse(prediction) : prediction;

          const fraudProb = data.fraud * 100;
          const notFraudProb = data.not_fraud * 100;

          return (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center p-3 border rounded-lg bg-red-50 border-red-200">
                <span className="font-medium text-red-800">⚠️ Fraud Risk</span>
                <span className="font-semibold text-red-900">{fraudProb.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50 border-green-200">
                <span className="font-medium text-green-800">✅ Safe / Not Fraud</span>
                <span className="font-semibold text-green-900">{notFraudProb.toFixed(1)}%</span>
              </div>
            </div>
          );
        })()}

        {prediction && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How Your Inputs Affect the Probability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Transaction Amount:</strong> This has a moderate influence (21%) on the fraud probability. Larger amounts may slightly increase the risk, so entering a high value could elevate the fraud likelihood.
              </p>
              <p>
                <strong>Sender&apos;s Previous Balance:</strong> This is the most significant factor (24%) in determining fraud. A low balance before the transaction might suggest higher risk, while a substantial balance could indicate a safer transaction.
              </p>
              <p>
                <strong>Receiver&apos;s Previous Balance:</strong> This has a lower impact (13%) but still matters. A receiver with a low balance might slightly raise the fraud probability, especially if paired with other risk factors.
              </p>
              <p>
                <strong>Transaction Type:</strong> The type of transaction plays a role, with <strong>Transfer</strong> (22%) and <strong>Withdrawal</strong> (8%) having more influence than <strong>Payment</strong> (10%) or <strong>Debit</strong> (0%). Choosing a <strong>Deposit</strong> typically aligns with lower risk, while a <strong>Transfer</strong> or <strong>Withdrawal</strong> might increase it slightly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
