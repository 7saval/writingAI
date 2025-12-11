import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            // 애니메이션을 위해 잠시 대기
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!isVisible && !open) return null;

    // 포탈을 사용하여 모달을 body 최상위에 렌더링
    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg transition-all duration-200 ${open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                    {description && (
                        <p className="text-sm text-slate-500">{description}</p>
                    )}
                </div>

                <div className="py-2">
                    {children}
                </div>

                {footer && (
                    <div className="mt-6 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}