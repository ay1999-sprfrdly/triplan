
import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            {text && <p className="text-slate-500 text-sm animate-pulse">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;