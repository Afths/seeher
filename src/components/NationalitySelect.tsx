import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NationalitySelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function NationalitySelect({ 
  label, 
  placeholder, 
  value, 
  onChange
}: NationalitySelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch existing nationalities from database
  useEffect(() => {
    const fetchOptions = async () => {
      const { data } = await supabase
        .from("women")
        .select("nationality")
        .eq("status", "APPROVED")
        .not("nationality", "is", null);

      if (data) {
        const allValues = new Set<string>();
        data.forEach((item) => {
          if (item.nationality) {
            allValues.add(item.nationality);
          }
        });
        setAvailableOptions(Array.from(allValues).sort());
      }
    };

    fetchOptions();
  }, []);

  // Update search term when value changes externally
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableOptions.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions(availableOptions);
      setHighlightedIndex(-1);
    }
  }, [searchTerm, availableOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        const selectedOption = filteredOptions[highlightedIndex];
        setSearchTerm(selectedOption);
        onChange(selectedOption);
        setIsOpen(false);
      }
      setHighlightedIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleOptionClick = (option: string) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={option}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                    index === highlightedIndex ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}