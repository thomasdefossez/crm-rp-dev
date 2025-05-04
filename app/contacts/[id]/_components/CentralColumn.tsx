'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Lock } from 'lucide-react';
import CreateEmailModal from './CreateEmailModal';

export default function CentralColumn() {
    const [onglet, setOnglet] = useState('notes');
    const [inputVisible, setInputVisible] = useState(false);
    const [content, setContent] = useState('');
    const [activities, setActivities] = useState<{ type: string; content: string }[]>([]);
    const [emailModalOpen, setEmailModalOpen] = useState(false); // Gère l'ouverture de la popin

    const handleAdd = () => {
        if (!content) return;
        setActivities([...activities, { type: onglet, content }]);
        setContent('');
        setInputVisible(false);
    };

    return (
        <div>
            {/* Onglets */}
            <Tabs value={onglet} onValueChange={(val) => { setOnglet(val); setInputVisible(false); }} className="mb-4">
                <TabsList className="flex gap-8 border-b px-4 bg-blanc-600">
                    {['notes', 'rappels', 'emails', 'appels', 'réunions'].map((valeur) => (
                        <TabsTrigger
                            key={valeur}
                            value={valeur}
                            className={`pb-3 border-none rounded-none shadow-none px-0 text-sm font-medium ${
                                onglet === valeur
                                    ? 'text-violet-600 bg-blanc-800' // Fond violet pour l'onglet sélectionné
                                    : 'text-violet-600 bg-transparent' // Fond transparent pour les onglets non sélectionnés
                            }`}
                        >
                            {valeur.charAt(0).toUpperCase() + valeur.slice(1)} {/* Affiche le texte avec la première lettre en majuscule */}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Boutons Ajouter */}
            {onglet !== 'emails' && (
                <div className="border rounded-lg p-4 space-y-4">
                    {inputVisible ? (
                        <div className="border rounded-lg p-4">
                            <textarea
                                placeholder="Écrivez une note. Utilisez @ pour taguer vos coéquipiers."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                className="w-full border-none focus:ring-0 text-gray-900 text-sm placeholder-gray-400"
                            />
                            <div className="flex justify-end mt-2">
                                <Button disabled={!content} className="bg-violet-600 text-white hover:bg-violet-700" onClick={handleAdd}>
                                    Ajouter
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setInputVisible(true)}>
                                {onglet === 'notes' && 'Ajouter une note'}
                                {onglet === 'appels' && 'Ajouter un appel'}
                                {onglet === 'réunions' && 'Ajouter une réunion'}
                            </Button>
                        </div>
                    )}

                    {/* Liste des activités */}
                    {activities
                        .filter((a) => a.type === onglet)
                        .map((a, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="text-violet-600 w-4 h-4" />
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback>TD</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm text-gray-900">Thomas Defossez</span>
                                    <span className="text-xs text-gray-400">à l’instant</span>
                                </div>
                                <p className="text-sm text-gray-900">{a.content}</p>
                                <div className="flex gap-2 text-xs text-gray-400">
                                    <span>Éditer</span>
                                    <span>•</span>
                                    <span>Supprimer</span>
                                    <span>•</span>
                                    <span>Commenter</span>
                                    <span>•</span>
                                    <span>Me le rappeler</span>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Emails onglet */}
            {onglet === 'emails' && (
                <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" className="text-sm">Journal des emails</Button>
                        <div
                            className="flex items-center bg-muted text-muted-foreground px-4 py-2 rounded-md gap-2 cursor-pointer"
                            onClick={() => setEmailModalOpen(true)} // Ouvre la modal
                        >
                            Créer un email
                            <div className="flex items-center justify-center bg-black text-white rounded-md p-1">
                                <Lock className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-8">
                        Il n’y a pas encore d’emails enregistrés pour ce contact.
                    </div>
                </div>
            )}

            {/* Modal Create Email */}
            <CreateEmailModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
        </div>
    );
}