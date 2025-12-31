import React, { useRef } from "react";
import { Button } from "./ui/button";
import { EyeIcon, type EyeIconHandle } from "./icons/EyeIcon";
import { InfoText } from "./InfoText";

interface ControlsProps {
    onReveal: () => void;
    canReveal: boolean;
    disabledReason?: string;
}

export const Controls: React.FC<ControlsProps> = ({
    onReveal,
    canReveal,
    disabledReason,
}) => {
    const eyeRef = useRef<EyeIconHandle>(null);
    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <Button
                onClick={onReveal}
                disabled={!canReveal}
                size="lg"
                onMouseEnter={() => eyeRef.current?.startAnimation()}
                onMouseLeave={() => eyeRef.current?.stopAnimation()}
                className={`
          ${canReveal
                        ? ""
                        : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    }
        `}
            >
                <EyeIcon ref={eyeRef} />
                Reveal Votes
            </Button>

            {!canReveal && disabledReason && (
                <InfoText text={disabledReason} />
            )}
        </div>
    );
};
