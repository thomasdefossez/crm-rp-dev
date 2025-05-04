'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function CreateEmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>SMTP Integration</DialogTitle>
                    <DialogDescription>
                        To create and send emails, you need to integrate your SMTP provider.
                        Please follow the steps below to connect your SMTP account.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input placeholder="SMTP Server" />
                    <Input placeholder="Port" />
                    <Input placeholder="Username" />
                    <Input placeholder="Password" type="password" />
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="ml-2 bg-violet-600 text-white hover:bg-violet-700">
                        Connect SMTP
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}