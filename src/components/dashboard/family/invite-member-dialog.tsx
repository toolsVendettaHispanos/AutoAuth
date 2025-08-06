
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MailPlus, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { inviteUserToFamily } from "@/lib/actions/family.actions";

interface InviteMemberDialogProps {
    familyId: string;
    allUsers: { id: string; name: string }[];
}

export function InviteMemberDialog({ familyId, allUsers }: InviteMemberDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleInvite = async () => {
        if (!selectedUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar a un jugador.' });
            return;
        }

        startTransition(async () => {
            const result = await inviteUserToFamily(selectedUser, familyId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Invitación enviada correctamente.' });
                setIsOpen(false);
                setSelectedUser(null);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <MailPlus className="mr-2 h-4 w-4" />
                    Invitar Miembro
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invitar a un Jugador</DialogTitle>
                    <DialogDescription>
                        Selecciona a un jugador sin familia para enviarle una invitación.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="user-select">Jugador</Label>
                    <Select onValueChange={setSelectedUser}>
                        <SelectTrigger id="user-select">
                            <SelectValue placeholder="Selecciona un jugador..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allUsers.length > 0 ? (
                                allUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>No hay jugadores para invitar.</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleInvite} disabled={isPending || !selectedUser}>
                         {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Enviar Invitación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
