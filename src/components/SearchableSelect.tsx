import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  variant?: "secondary" | "outline";
  field: "languages" | "areas_of_expertise" | "keywords" | "nationality";
}

export function SearchableSelect({ 
  label, 
  placeholder, 
  selectedItems, 
  onItemsChange, 
  variant = "secondary",
  field 
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch existing options from database
  useEffect(() => {
    const fetchOptions = async () => {
      const { data } = await supabase
        .from("women")
        .select(field)
        .eq("status", "APPROVED");

      if (data) {
        const allValues = new Set<string>();
        data.forEach((item) => {
          const values = item[field];
          if (Array.isArray(values)) {
            values.forEach(value => allValues.add(value));
          } else if (values) {
            allValues.add(values);
          }
        });
        setAvailableOptions(Array.from(allValues).sort());
      }
    };

    fetchOptions();
  }, [field]);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableOptions.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedItems.includes(option)
      );
      setFilteredOptions(filtered);
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions(availableOptions.filter(option => !selectedItems.includes(option)));
      setHighlightedIndex(-1);
    }
  }, [searchTerm, availableOptions, selectedItems]);

  const addItem = (item: string) => {
    if (item.trim() && !selectedItems.includes(item.trim())) {
      onItemsChange([...selectedItems, item.trim()]);
      setSearchTerm("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const removeItem = (item: string) => {
    onItemsChange(selectedItems.filter(i => i !== item));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        addItem(filteredOptions[highlightedIndex]);
      } else if (searchTerm.trim()) {
        addItem(searchTerm);
      }
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
    addItem(option);
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
        <div className="flex items-center">
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
            className="absolute right-1 h-8 w-8 p-0"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Dropdown */}
        {isOpen && (filteredOptions.length > 0 || searchTerm) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
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
            ) : searchTerm && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Press Enter to add "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected items */}
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedItems.map((item) => (
          <Badge key={item} variant={variant} className="cursor-pointer">
            {item}
            <X
              className="w-3 h-3 ml-1"
              onClick={() => removeItem(item)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}