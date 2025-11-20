/**
 * ARRAY INPUT FIELD COMPONENT
 *
 * A reusable component for managing arrays of string values.
 * Allows users to add multiple items one at a time.
 *
 * Features:
 * - Input field with add button
 * - Visual badges for added items
 * - Remove items by clicking X on badges
 * - Press Enter to add item
 * - Prevents duplicate entries
 * - Trims whitespace from input
 *
 * Used for fields that accept multiple string values like:
 * - Keywords
 * - Tags
 * - Custom lists
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface ArrayInputFieldProps {
  label: string;
  placeholder: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  variant?: "secondary" | "outline";
}

export function ArrayInputField({ 
  label, 
  placeholder, 
  items, 
  onItemsChange, 
  variant = "secondary" 
}: ArrayInputFieldProps) {
  // Current input value
  const [newItem, setNewItem] = useState("");

  /**
   * Add item to the array
   * Trims whitespace and prevents duplicates
   */
  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onItemsChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  /**
   * Remove item from the array
   */
  const removeItem = (item: string) => {
    onItemsChange(items.filter(i => i !== item));
  };

  /**
   * Handle Enter key press
   * Adds item when user presses Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      {/* Input field and add button */}
      <div className="flex gap-2 mb-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {/* Display added items as badges */}
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant={variant} className="cursor-pointer">
            {item}
            {/* Remove button */}
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
