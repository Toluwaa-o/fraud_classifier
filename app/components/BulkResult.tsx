import { BulkResult } from "@/types/BulkResults"

const BulkResults = (prop:{index: number, result: BulkResult, notFraudProb: number, fraudProb: number}) => {
    return (
        <div
            key={prop.index}
            className="p-4 border rounded-lg shadow-sm bg-white space-y-2"
        >
            <div className="flex justify-between text-sm text-gray-600">
                <span>💰 Amount</span>
                <span className="font-medium">{prop.result.amount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
                <span>📊 Initial Balance</span>
                <span className="font-medium">{prop.result.sender_prev_bal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
                <span>🕒 Hour</span>
                <span className="font-medium">{prop.result.hour}</span>
            </div>

            <div className="flex justify-between items-center p-3 border rounded-lg bg-red-50 border-red-200">
                <span className="font-medium text-red-800">⚠️ Fraud Risk</span>
                <span className="font-semibold text-red-900">
                    {prop.fraudProb.toFixed(1)}%
                </span>
            </div>

            <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50 border-green-200">
                <span className="font-medium text-green-800">✅ Safe / Not Fraud</span>
                <span className="font-semibold text-green-900">
                    {prop.notFraudProb.toFixed(1)}%
                </span>
            </div>
        </div>
    )
}

export default BulkResults