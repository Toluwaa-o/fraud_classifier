import { NextRequest, NextResponse } from "next/server";
import xgboost from 'xgboost_node';

async function getPrediction(amount: number, senderPrevBal: number, receiverPrevBal: number, transactionType: string) {
    const expectedCols = ['CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER'];
    const features = [amount, senderPrevBal, receiverPrevBal];

    expectedCols.forEach((col) => {
        features.push(transactionType.toUpperCase() === col ? 1 : 0);
    });

    await xgboost.loadModel('model.json');

    const predictions = await xgboost.predict([features]);
    const p = predictions[0];

    const notFraud = 1 - p;
    const fraud = p;

    console.log('Not fraud:', notFraud, 'Fraud:', fraud);
    return { notFraud, fraud };
}

export const POST = async (
    request: NextRequest
): Promise<NextResponse> => {
    try {

        const { amount, senderPrevBal, receiverPrevBal, transactionType } = await request.json();
        const { notFraud, fraud } = await getPrediction(amount, senderPrevBal, receiverPrevBal, transactionType)

        return NextResponse.json({
            "not_fraud": notFraud,
            "fraud": fraud
        }, { status: 200 })
    } catch (error) {
        console.error("Preidiction Error:", error);
        return NextResponse.json({ success: false, error: "Prediction failed" }, { status: 500 });
    }
}