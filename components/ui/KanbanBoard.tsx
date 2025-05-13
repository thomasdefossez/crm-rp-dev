'use client'

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Card } from '@/components/ui/card'

export function KanbanBoard({ items }: { items: string[] }) {
    const [columns, setColumns] = useState({ 'À faire': items })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    )

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <div className="grid grid-cols-3 gap-4">
                {Object.entries(columns).map(([columnName, items]) => (
                    <div key={columnName} className="bg-muted p-4 rounded">
                        <h2 className="font-semibold text-sm mb-2">{columnName}</h2>
                        <SortableContext items={items} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {items.map((id) => (
                                    <SortableItem key={id} id={id} />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                ))}
            </div>
        </DndContext>
    )
}

function SortableItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-2 bg-white shadow cursor-move"
        >
            {id}
        </Card>
    )
}