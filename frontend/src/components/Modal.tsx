import type { ReactNode } from "react";

interface ModalProps {
    title: string;
    children: ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel?: string;
}

export function Modal({
    title,
    children,
    onCancel,
    onConfirm,
    cancelLabel = "Cancelar",
    confirmLabel = "Confirmar",
}: ModalProps) {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3 className="modal-title">{title}</h3>
                <div className="modal-body">{children}</div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className="btn-danger" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}