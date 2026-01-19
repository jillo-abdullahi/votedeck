import { Skeleton } from "@/components/ui/skeleton";

export const RoomCardSkeleton = () => {
    return (
        <div className="flex flex-col justify-between bg-slate-800/30 ring-1 ring-slate-700/30 rounded-2xl p-4 h-[180px]">
            {/* Top Section: Avatar + Info */}
            <div className="flex items-start gap-4 mb-6">
                {/* Avatar Skeleton */}
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title Skeleton */}
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <div className="flex items-center gap-1.5">
                        {/* ID Skeleton */}
                        <Skeleton className="h-4 w-20 rounded-md" />
                        {/* Copy Button Skeleton */}
                        <Skeleton className="h-6 w-6 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Meta + Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30 mt-auto">
                <div className="flex items-center gap-3">
                    {/* Date Skeleton */}
                    <Skeleton className="h-4 w-24 rounded-md" />
                </div>

                <div className="flex items-center gap-2">
                    {/* Active Users Skeleton */}
                    <Skeleton className="h-4 w-16 rounded-md" />
                    {/* Delete Button Skeleton (conditionally potentially there, so we show it for balance or skip it) */}
                    {/* We can mimic the presence of the delete button space */}
                    <Skeleton className="h-8 w-8 rounded-lg opacity-50" />
                </div>
            </div>
        </div>
    );
};
