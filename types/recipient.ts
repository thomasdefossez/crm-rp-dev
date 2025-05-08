// types/recipient.ts

export interface Recipient {
    id: string;
    email: string;
    type: 'contact' | 'list';
}