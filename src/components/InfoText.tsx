export const InfoText = ({ text }: { text: string | React.ReactNode }) => {
    return (
        <p className="flex items-center text-xs sm:text-sm text-slate-500 italic animate-in fade-in slide-in-from-top-1 duration-500">
            <span className="text-center">{text}</span>
        </p>
    )
}