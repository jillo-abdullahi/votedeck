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
        <>
            <div className="hidden sm:flex flex-col items-center gap-4 p-6">
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
                    <EyeIcon ref={eyeRef} className="w-6 h-6" />
                    Reveal Votes
                </Button>

                {!canReveal && disabledReason && (
                    <InfoText text={disabledReason} />
                )}
            </div>
            <div className="flex sm:hidden flex-col items-center gap-4 p-6">
                <Button
                    onClick={onReveal}
                    disabled={!canReveal}
                    size="sm"
                    onMouseEnter={() => eyeRef.current?.startAnimation()}
                    onMouseLeave={() => eyeRef.current?.stopAnimation()}
                    className={`
          ${canReveal
                            ? ""
                            : "bg-slate-800 text-slate-600 cursor-not-allowed"
                        }
        `}
                >
                    <EyeIcon ref={eyeRef} className="w-4 h-4" />
                    Reveal
                </Button>
            </div>
        </>
    );
};
