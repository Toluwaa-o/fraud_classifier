import xgboost as xgb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


model = xgb.Booster()
model.load_model("api/model.json")


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

    features = xgb.DMatrix([raw_features])

    try:
        proba_full = model.predict(features)
        print(1-proba_full[0], proba_full[0])

        return 1-proba_full[0], proba_full[0]
    except Exception as e:
        print(str(e))


@app.post("/predict")
def predict(data: TransactionData):
    try:
        notFraud, fraud = get_prediction(
            data.amount, data.sender_prev_bal, data.receiver_prev_bal, data.type)
        return {
            "not_fraud": float(notFraud),
            "fraud": float(fraud)
        }
    except Exception as e:
        return {'error': str(e)}
