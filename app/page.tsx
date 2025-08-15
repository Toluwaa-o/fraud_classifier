"use client";

import { useState } from "react";

type BulkResult = {
  amount: number;
  sender_prev_bal: number;
  credit: number;
  hour: number;
  prediction: string;
  fraud_probability: number;
};

export default function Page() {
  const [formData, setFormData] = useState({
    amount: "",
    sender_prev_bal: "",
    credit: "credit",
    hour: ""
  });

  const [prediction, setPrediction] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

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

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          sender_prev_bal: parseFloat(formData.sender_prev_bal),
          hour: parseFloat(formData.hour),
          credit: formData.credit,
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

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setError("Please select a CSV or Excel file");
      return;
    }
    setBulkLoading(true);
    setError(null);
    setBulkResults(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const formData = new FormData();
      formData.append("file", bulkFile);

      const res = await fetch(`${API_URL}/predict-bulk`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setBulkResults(data);
      } else {
        setError("Invalid bulk response");
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError("Error uploading file");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-6 font-sans">
      <header className="w-full max-w-md bg-white text-gray-900 p-6 rounded-2xl shadow-xl mb-8 border border-gray-100 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Fraud Detection</h1>
        <p className="text-gray-600 text-sm font-medium">Analyze transaction details with precision</p>
      </header>

      {/* Single Transaction Form */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="number"
            name="amount"
            placeholder="Transaction Amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50"
          />
          <input
            type="number"
            name="sender_prev_bal"
            placeholder="Sender's Previous Balance"
            value={formData.sender_prev_bal}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50"
          />
          <input
            type="number"
            name="hour"
            min="0"
            max="23"
            placeholder="Hour of the day"
            value={formData.hour}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50"
          />
          <select
            title="transaction type"
            name="type"
            value={formData.credit}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl"
          >
            {loading ? "Analyzing..." : "Analyze Transaction"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Bulk Fraud Prediction</h2>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <input
            aria-label="transactions"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50"
          />
          <button
            type="submit"
            disabled={bulkLoading}
            className="w-full bg-green-600 text-white p-4 rounded-xl"
          >
            {bulkLoading ? "Processing..." : "Upload & Predict"}
          </button>
        </form>

        {bulkResults && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Predictions:</h3>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-auto text-sm">
              {JSON.stringify(bulkResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 p-3 bg-red-50 text-red-800 border border-red-100 rounded-xl font-medium">
          {error}
        </p>
      )}

      {(prediction || bulkResults) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How Your Inputs Affect the Probability
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Transaction Amount:</strong> This is by far the most influential factor
              (≈53%) in determining fraud probability. Higher amounts significantly raise
              the risk, while smaller transactions tend to be safer.
            </p>
            <p>
              <strong>Hour of Transaction:</strong> Time of day contributes about 23% to the model’s
              decision. Transactions during late-night or early-morning hours are generally riskier.
            </p>
            <p>
              <strong>Credit Transaction:</strong> Whether the transaction is a credit (deposit) or
              not influences fraud probability by ≈14%. Certain transaction types may be
              more targeted by fraudsters.
            </p>
            <p>
              <strong>Sender&apos;s Previous Balance:</strong> This has the smallest impact (≈9%),
              but still matters. A low sender balance before the transaction may slightly
              increase the chance of it being flagged as fraud.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
