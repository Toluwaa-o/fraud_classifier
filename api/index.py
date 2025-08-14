from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle

app = FastAPI(docs_url="/api/py/docs")

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/home')
def home():
    return {
        "msg": "Hello"
    }


with open('api/fraud_detection_model.pkl', 'rb') as file:
    model = pickle.load(file)


class TransactionData(BaseModel):
    amount: float
    sender_prev_bal: float
    receiver_prev_bal: float
    type: str  # CASH_OUT, DEBIT, PAYMENT, TRANSFER


def get_prediction(amount, sender_prev_bal, receiver_prev_bal, transaction_type):
    raw_features = [
        amount,
        sender_prev_bal,
        receiver_prev_bal,
    ]

    expected_cols = ['CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']

    for col in expected_cols:
        raw_features.append(int(transaction_type.upper() == col))

    features = np.array(raw_features).reshape(1, -1)

    try:
        prediction = model.predict_proba(features)[0]
        return prediction.tolist()
    except Exception as e:
        print(str(e))


@app.post("/predict")
def predict(data: TransactionData):
    try:
        notFraud, fraud = get_prediction(
            data.amount, data.sender_prev_bal, data.receiver_prev_bal, data.type)
        return {
            "not_fraud": notFraud,
            "fraud": fraud
        }
    except Exception as e:
        return {'error': str(e)}
