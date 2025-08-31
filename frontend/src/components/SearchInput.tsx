import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    autoFocus?: boolean;
}

const SearchInput = React.memo<SearchInputProps>(({
    value,
    onChange,
    placeholder = "Search...",
    isLoading = false,
    disabled = false,
    className = "",
    onFocus,
    onBlur,
    autoFocus = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Preserve focus when component re-renders
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    const handleClear = () => {
        onChange('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={`relative ${className}`}>
            <div
                className={`
                    relative flex items-center
                    border rounded-lg transition-all duration-200
                    ${isFocused
                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-sm'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                `}
            >
                {/* Search Icon */}
                <div className="absolute left-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 text-gray-400" />
                    )}
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full pl-10 pr-10 py-2.5 
                        bg-transparent outline-none
                        placeholder-gray-400 text-gray-900
                        ${disabled ? 'cursor-not-allowed' : ''}
                    `}
                    autoComplete="off"
                    spellCheck="false"
                />

                {/* Clear Button */}
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 flex items-center justify-center 
                                 h-5 w-5 rounded-full hover:bg-gray-100 
                                 transition-colors duration-150"
                        tabIndex={-1}
                    >
                        <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
