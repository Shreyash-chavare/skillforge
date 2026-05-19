import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-1">
                    {`Loading ${message}...`}
                </h2>
                <p className="text-sm text-slate-500">
                    This will just take a moment
                </p>
            </div>
        </div>
    );
};

export default Loading;