export type BulkResult = {
    amount: number;
    sender_prev_bal?: number;
    receiver_prev_bal?: number;
    credit: number;
    hour: number;
    prediction: string;
    fraud_probability: number;
};