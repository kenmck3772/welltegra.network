
import React, { useEffect, useState } from 'react';
import { NotificationState } from '../types';

interface NotificationProps {
    notification: NotificationState;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
    const { message, type, visible } = notification;
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
        } else {
            // A small delay to allow for the fade-out animation
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [visible]);


    const baseClasses = 'fixed top-5 left-1/2 p-4 rounded-md shadow-lg text-white font-semibold transition-all duration-300 ease-in-out';
    
    const typeClasses = {
        success: 'bg-green-600',
        warn: 'bg-yellow-500',
        error: 'bg-red-600',
        info: 'bg-blue-500',
    };

    const stateClasses = visible
        ? 'opacity-100 visible transform -translate-x-1/2 translate-y-0'
        : 'opacity-0 invisible transform -translate-x-1/2 -translate-y-12';

    if (!show && !visible) return null;

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${stateClasses}`}>
            <span>{message}</span>
        </div>
    );
};

export default Notification;
