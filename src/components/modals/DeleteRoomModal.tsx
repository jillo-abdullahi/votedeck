import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteRoomsId } from '@/lib/api/generated';
import { ModalHeader } from '@/components/ModalHeader';
import { ModalAlert } from '@/components/ModalAlert';

interface DeleteRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleted: () => void;
    roomId: string;
    roomName: string;
    activeUsers: number;
}

export const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
    isOpen,
    onClose,
    onDeleted,
    roomId,
    roomName,
    activeUsers
}) => {
    const { mutateAsync: deleteRoom, isPending: isDeleting } = useDeleteRoomsId();

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            await deleteRoom({ id: roomId });
            onDeleted();
            onClose();
        } catch (error) {
            console.error('Failed to delete room:', error);
            alert('Failed to delete room. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/50 p-8 animate-in zoom-in-95 duration-300 flex flex-col gap-6">
                <ModalHeader
                    title="Delete Room"
                    subtitle={`Permanently delete ${roomName}`}
                    icon={<Trash2 size={32} className='text-red-400' />}
                    onClose={onClose}
                />

                <div className="flex flex-col gap-6">

                    <ModalAlert
                        variant="destructive"
                        title={activeUsers > 0 ? "Active Players Warning" : "Warning"}
                        description={
                            activeUsers > 0 ? (
                                <>
                                    There are currently <strong>{activeUsers} active players</strong> in this room (excluding you).
                                    Deleting it will immediately disconnect them and end their session.
                                </>) : <>
                                Are you sure you want to delete this room? <br /> Users will no longer be able to join using this room code.
                                <strong> This action cannot be undone.</strong>
                            </>
                        }
                    />


                    <div className="flex gap-3 w-full pt-2">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1"
                        >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Room'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
