const ResultCard = ({
    label,
    value,
    color,
    icon,
    bgColor,
    borderColor,
}: {
    label: string;
    value: string;
    color: string;
    icon: string;
    bgColor: string;
    borderColor: string;
}) => (
    <div
        className={`flex justify-between w-[70vw] md:w-[30vw] items-center p-4 rounded-xl border ${bgColor} ${borderColor} shadow-sm`}
    >
        <span className={`font-medium ${color}`}>
            {icon} {label}
        </span>
        <span className={`font-semibold ${color}`}>{value}%</span>
    </div>
);

export default ResultCard;