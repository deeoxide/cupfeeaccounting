import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = "ເລືອກ..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(opt => opt.id === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const s = search.toLowerCase();
    return options.filter(opt => 
      opt.name.toLowerCase().includes(s) || 
      opt.id.toLowerCase().includes(s)
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2.5 font-medium outline-none cursor-pointer flex justify-between items-center hover:border-slate-400 transition-colors shadow-sm"
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-2 border-b border-gray-50 flex items-center bg-gray-50/50">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input 
              autoFocus
              type="text"
              className="w-full bg-transparent p-2 text-sm outline-none font-medium"
              placeholder="ຄົ້ນຫາ (ຊື່ ຫຼື ລະຫັດ)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${value === opt.id ? 'bg-blue-50 text-slate-900 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span>{opt.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono ml-2">{opt.id}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-400 text-center">ບໍ່ພົບຂໍ້ມູນ</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
