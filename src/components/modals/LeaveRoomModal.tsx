import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ModalHeader } from '@/components/ModalHeader';
import { ModalAlert } from '@/components/ModalAlert';

interface LeaveRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/50 p-8 animate-in zoom-in-95 duration-300 flex flex-col gap-6">
                <ModalHeader
                    title="Leave Game?"
                    subtitle="Confirm leaving the game room"
                    icon={<LogOut size={32} className='text-red-400' />}
                    onClose={onClose}
                />

                <div className="flex flex-col gap-6">

                    <ModalAlert
                        variant="destructive"
                        title="You will be removed from the game"
                        description={
                            <>
                                Are you sure you want to leave this game? <br />
                                You will be removed from the players list and will need to rejoin to participate again.
                            </>
                        }
                    />

                    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full pt-2">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="sm:flex-1"
                        >
                            Leave Game
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
