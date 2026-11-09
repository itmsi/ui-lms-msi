import { useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';

export const useDragReorder = (count: number, onMove: (from: number, to: number) => void, handleOnly = false) => {
    const [armedIndex, setArmedIndex] = useState<number | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    const reset = () => {
        setArmedIndex(null);
        setDragIndex(null);
        setOverIndex(null);
    };

    const itemProps = (index: number) => ({
        draggable: handleOnly === false || armedIndex === index,
        onDragStart: (event: DragEvent<HTMLElement>) => {
            setDragIndex(index);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(index));
        },
        onDragOver: (event: DragEvent<HTMLElement>) => {
            if (dragIndex === null) {
                return;
            }

            event.preventDefault();
            setOverIndex(index);
        },
        onDrop: (event: DragEvent<HTMLElement>) => {
            event.preventDefault();

            if (dragIndex !== null && dragIndex !== index) {
                onMove(dragIndex, index);
            }

            reset();
        },
        onDragEnd: reset,
    });

    const handleProps = (index: number) => ({
        onPointerDown: () => setArmedIndex(index),
        onPointerUp: () => setArmedIndex(null),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === 'ArrowUp' && index > 0) {
                event.preventDefault();
                onMove(index, index - 1);
            }

            if (event.key === 'ArrowDown' && index < count - 1) {
                event.preventDefault();
                onMove(index, index + 1);
            }
        },
    });

    return { itemProps, handleProps, dragIndex, overIndex };
};
