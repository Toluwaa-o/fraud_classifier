import { BulkResult } from "@/types/BulkResults"

const BulkResults = (prop: { result: BulkResult, notFraudProb: number, fraudProb: number, isFraud: boolean }) => {
    return (
        <div
            className="p-4 border rounded-lg shadow-sm bg-white space-y-2"
        >
            <div className="flex justify-between text-sm text-gray-600">
                <span>💰 Amount</span>
                <span className="font-medium">{prop.result.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
                <span>📊 Initial Balance</span>
                <span className="font-medium">{prop.result.sender_prev_bal?.toFixed(2)}</span>
            </div>

            {prop.isFraud ? <div className="flex justify-between items-center p-3 border rounded-lg bg-red-50 border-red-200">
                <span className="font-medium text-red-800">⚠️ Fraud Risk</span>
            </div>
                :
                <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50 border-green-200">
                    <span className="font-medium text-green-800">✅ Safe / Not Fraud</span>
                </div>}
        </div>
    )
}

export default BulkResults