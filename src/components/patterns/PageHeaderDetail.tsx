import type { ReactNode } from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    backPath: string | (() => void); // Bisa berupa string atau fungsi untuk navigasi kembali
    subtitle?: ReactNode | null;

    // Slot untuk konten kanan (badge, tombol, dll)
    actions?: ReactNode;
}

export default function PageHeaderDetail({ title, backPath, subtitle, actions }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between lg:h-16 bg-white shadow-card border border-line rounded-2xl px-6">
            <div className="flex items-center gap-1 w-full">
                <Button
                    size='sm'
                    onClick={() => {
                        if (typeof backPath === 'string') {
                            // `navigate` mengembalikan Promise di React Router v7; tidak ada
                            // yang perlu ditunggu di sini, jadi ditandai sengaja diabaikan.
                            void navigate(backPath);
                        } else if (typeof backPath === 'function') {
                            backPath();
                        }
                    }}
                    className="w-9 flex items-center gap-2 p-1 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                    <ChevronLeft size={20} />
                </Button>
                <div className="border-l border-gray-300 h-6 mx-3"></div>

                <div className="flex items-center gap-4 justify-between w-full lg:flex-row flex-col">
                    <div>
                        <h1 className="ms-2 font-display font-bold text-xl">{title}</h1>
                        {subtitle !== null && subtitle !== undefined && (
                            typeof subtitle === 'string' || typeof subtitle === 'number' ? (
                                <p className="ms-2 text-sm text-gray-600">{subtitle}</p>
                            ) : (
                                <div className="ms-2 text-sm text-gray-600 flex items-center gap-1 flex-wrap">
                                    {subtitle}
                                </div>
                            )
                        )}
                    </div>

                    {actions && (
                        <div className="capitalize ms-2 flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
