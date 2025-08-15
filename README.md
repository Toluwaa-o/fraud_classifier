# 💳 Fraud Detection App

A full-stack application that predicts fraudulent transactions in real-time using machine learning.
The app features a **frontend** for collecting transaction details, a **FastAPI** backend for inference, and a trained fraud detection model to help financial institutions reduce losses.

---

## 🚀 Features

* **Interactive Frontend** – Collects transaction details from users.
* **FastAPI Backend** – Handles requests and serves model predictions.
* **Machine Learning Model** – Detects fraud with high accuracy, considering class imbalance.
* **Real-time Predictions** – Instant feedback on transaction legitimacy.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (TypeScript, TailwindCSS)
* **Backend:** FastAPI (Python)
* **Modeling:** scikit-learn, pandas, numpy
* **Deployment:** (Vercel)

---


## 📊 Input Fields

The model takes the following transaction details:

| Field               | Type  | Description                                                   |
| ------------------- | ----- | ------------------------------------------------------------- |
| amount              | float | Transaction amount                                            |
| hour              | int | Hour of the day                                            |
| transaction_type              | string | Intra Bank, Sender or Receiver transaction                                           |
| sender\_prev\_bal   | float | Optional, Sender's balance before transaction                           |
| receiver\_prev\_bal | float | Optional, Receiver's balance before transaction                         |
| credit                | enum  | Transaction type: credit or debit |

---

## 🧠 Model

The fraud detection model is trained with **class imbalance handling** to ensure that rare fraud cases are detected effectively, helping banks save significant amounts of money.
