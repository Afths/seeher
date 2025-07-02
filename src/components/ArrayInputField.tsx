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
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onItemsChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (item: string) => {
    onItemsChange(items.filter(i => i !== item));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <Label>{label}</Label>
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
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
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