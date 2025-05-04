'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface TopicsModalProps {
    open: boolean;
    onClose: () => void;
    onSelectTopics: (topics: string[]) => void;
}

const AVAILABLE_TOPICS = [
    'Consumer Electronics',
    'Crime',
    'Defense & Military',
    'Demographics',
    'Design',
    'E-Commerce',
    'Economic Development',
];

export function TopicsModal({ open, onClose, onSelectTopics }: TopicsModalProps) {
    const [search, setSearch] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    const filteredTopics = AVAILABLE_TOPICS.filter((topic) =>
        topic.toLowerCase().includes(search.toLowerCase())
    );

    const toggleTopic = (topic: string) => {
        setSelectedTopics((prev) =>
            prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
        );
    };

    const handleSelect = () => {
        onSelectTopics(selectedTopics);
        onClose();
    };


        

}