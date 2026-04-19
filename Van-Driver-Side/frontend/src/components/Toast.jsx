import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast-container ${type}`}>
            {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message}</span>
        </div>
    );
}
