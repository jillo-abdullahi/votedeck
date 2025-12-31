export const InfoText = ({ text }: { text: string }) => {
    return (
        <p className="flex items-center text-sm text-slate-500 italic animate-in fade-in slide-in-from-top-1 duration-500">
            <span className="pl-1">{text}</span>
        </p>
    )
}