interface PredictionFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    formData: {
        amount: string;
        sender_prev_bal?: string;
        receiver_prev_bal?: string
        credit: string;
        hour: string;
    };
    transactionType: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    loading: boolean;
}

const SingleForm = ({ handleSubmit, formData, transactionType, handleChange, loading }: PredictionFormProps) => {
    return (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl mt-20">
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    type="number"
                    name="amount"
                    placeholder="Transaction Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl p-4 bg-gray-50"
                />

                {transactionType !== "receiver" && (
                    <input
                        type="number"
                        name="sender_prev_bal"
                        placeholder="Sender's Initial Balance"
                        value={formData.sender_prev_bal}
                        onChange={handleChange}
                        required={transactionType !== "receiver"}
                        className="w-full border rounded-xl p-4 bg-gray-50"
                    />
                )}

                {transactionType !== "sender" && (
                    <input
                        type="number"
                        name="receiver_prev_bal"
                        placeholder="Receiver's Initial Balance"
                        value={formData.receiver_prev_bal}
                        onChange={handleChange}
                        required={transactionType !== "sender"}
                        className="w-full border rounded-xl p-4 bg-gray-50"
                    />
                )}

                <input
                    type="number"
                    name="hour"
                    min="0"
                    max="23"
                    placeholder="Hour of the day"
                    value={formData.hour}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl p-4 bg-gray-50"
                />

                <select
                    title="Transaction type"
                    name="credit"
                    value={formData.credit}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-4 bg-gray-50"
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
    )
}

export default SingleForm