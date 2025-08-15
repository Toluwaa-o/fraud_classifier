"use client";

import { useState } from "react";
import ResultCard from "./components/ResultsCard";
import { BulkResult } from "@/types/BulkResults";
import BulkResults from "./components/BulkResult";
import SingleForm from "./components/SingleForm";

export default function Page() {
  const [transactionType, setTransactionType] = useState<string>("sender");

  const [formData, setFormData] = useState({
    amount: "",
    sender_prev_bal: "",
    receiver_prev_bal: "",
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

      const payload: Record<string, string | number> = {
        amount: parseFloat(formData.amount),
        hour: parseFloat(formData.hour),
        credit: formData.credit,
        transaction_type: transactionType
      };

      if (transactionType === "sender") {
        payload.sender_prev_bal = parseFloat(formData.sender_prev_bal);
      } else if (transactionType === "receiver") {
        payload.receiver_prev_bal = parseFloat(formData.receiver_prev_bal);
      } else if (transactionType === "intra") {
        payload.sender_prev_bal = parseFloat(formData.sender_prev_bal);
        payload.receiver_prev_bal = parseFloat(formData.receiver_prev_bal);
      }

      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data) {
        setPrediction(JSON.stringify(data, null, 2));
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
      const fileForm = new FormData();
      fileForm.append("file", bulkFile);
      fileForm.append("transaction_type", transactionType);

      const res = await fetch(`${API_URL}/predict-bulk`, {
        method: "POST",
        body: fileForm,
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

  const handleTabChange = (type: string) => {
    setTransactionType(type as string)
    setFormData({
      amount: "",
      sender_prev_bal: "",
      receiver_prev_bal: "",
      credit: "credit",
      hour: ""
    })
    setPrediction(null)
    setBulkFile(null)
    setBulkResults(null)
    setPrediction(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="fixed top-4 bg-white shadow-lg rounded-full flex space-x-4 px-4 py-2 z-50">
        {["sender", "receiver", "intra"].map((type) => (
          <button
            key={type}
            onClick={() => handleTabChange(type)}
            className={`px-3 py-1 rounded-full font-medium ${transactionType === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <SingleForm handleChange={handleChange} handleSubmit={handleSubmit} loading={loading} formData={formData} transactionType={transactionType} />

      {prediction && (() => {
        const data = typeof prediction === 'string' ? JSON.parse(prediction) : prediction;

        const fraudProb = (data.fraud * 100).toFixed(1);
        const notFraudProb = (data.not_fraud * 100).toFixed(1);
        return (
          <div className="mt-6 space-y-3">
            <ResultCard
              label="Fraud Risk"
              value={fraudProb}
              color="text-red-800"
              icon="⚠️"
              bgColor="bg-red-50"
              borderColor="border-red-200"
            />
            <ResultCard
              label="Safe / Not Fraud"
              value={notFraudProb}
              color="text-green-800"
              icon="✅"
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />
          </div>
        );
      })()}

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl mt-8">
        <h2 className="text-lg font-semibold mb-4">Bulk Fraud Prediction</h2>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <input
            title="Transactions"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            className="w-full border rounded-xl p-3 bg-gray-50"
          />
          <button
            type="submit"
            disabled={bulkLoading}
            className="w-full bg-green-600 text-white p-4 rounded-xl"
          >
            {bulkLoading ? "Processing..." : "Upload & Predict"}
          </button>
        </form>

        {bulkResults && bulkResults.length > 0 && (
          <div className="mt-6 space-y-4">
            {bulkResults.map((result, index) => {
              const fraudProb = result.fraud_probability;
              const notFraudProb = 100 - fraudProb;
              const isFraud = result.prediction === "FRAUD";

              return <BulkResults index={index} result={result} fraudProb={fraudProb} notFraudProb={notFraudProb} />
            })}
          </div>
        )}

      </div>

      {error && (
        <p className="mt-4 p-3 bg-red-50 text-red-800 border rounded-xl font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
