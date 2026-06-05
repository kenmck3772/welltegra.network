
import React from 'react';

interface HeaderProps {
    onExport: () => void;
    onImport: () => void;
    onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport, onImport, onClear }) => {
    return (
        <header className="bg-gray-800 border-b border-gray-700 p-3 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold text-white">3D Intelligent Slickline Tool String Assembler</h1>
            <div className="flex gap-2">
                <button
                    onClick={onExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                    Export
                </button>
                <button
                    onClick={onImport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                    Import
                </button>
                <button
                    onClick={onClear}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                    Clear String
                </button>
            </div>
        </header>
    );
};

export default Header;
