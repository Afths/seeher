import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface SearchFiltersProps {
  languages: string[];
  areasOfExpertise: string[];
  memberships: string[];
  selectedLanguages: string[];
  selectedAreasOfExpertise: string[];
  selectedMemberships: string[];
  onLanguageChange: (languages: string[]) => void;
  onAreasOfExpertiseChange: (areas: string[]) => void;
  onMembershipsChange: (memberships: string[]) => void;
}

export function SearchFilters({
  languages,
  areasOfExpertise,
  memberships,
  selectedLanguages,
  selectedAreasOfExpertise,
  selectedMemberships,
  onLanguageChange,
  onAreasOfExpertiseChange,
  onMembershipsChange
}: SearchFiltersProps) {
  const handleLanguageToggle = (language: string) => {
    const updated = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    onLanguageChange(updated);
  };

  const handleAreaToggle = (area: string) => {
    const updated = selectedAreasOfExpertise.includes(area)
      ? selectedAreasOfExpertise.filter(a => a !== area)
      : [...selectedAreasOfExpertise, area];
    onAreasOfExpertiseChange(updated);
  };

  const handleMembershipToggle = (membership: string) => {
    const updated = selectedMemberships.includes(membership)
      ? selectedMemberships.filter(m => m !== membership)
      : [...selectedMemberships, membership];
    onMembershipsChange(updated);
  };

  const FilterDropdown = ({ 
    title, 
    options, 
    selectedOptions, 
    onToggle 
  }: {
    title: string;
    options: string[];
    selectedOptions: string[];
    onToggle: (option: string) => void;
  }) => (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between bg-background/50 border-border/40"
          >
            <span className="text-xs font-medium">
              {selectedOptions.length === 0 
                ? title 
                : `${selectedOptions.length} selected`
              }
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-64 max-h-96 overflow-y-auto bg-background border-border/40"
          align="start"
        >
          <div className="p-2 space-y-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${title.toLowerCase()}-${option}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => onToggle(option)}
                />
                <label
                  htmlFor={`${title.toLowerCase()}-${option}`}
                  className="text-sm text-foreground cursor-pointer flex-1"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {selectedOptions.map((option, index) => (
            <div key={option} className="flex items-center gap-1">
              <Badge 
                variant="secondary" 
                className="text-xs cursor-pointer"
                onClick={() => onToggle(option)}
              >
                {option} ×
              </Badge>
              {index < selectedOptions.length - 1 && (
                <span className="text-xs text-muted-foreground font-medium">OR</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/40 rounded-2xl">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
          {languages.length > 0 && (
            <FilterDropdown
              title="LANGUAGES"
              options={languages}
              selectedOptions={selectedLanguages}
              onToggle={handleLanguageToggle}
            />
          )}

          {areasOfExpertise.length > 0 && (
            <FilterDropdown
              title="AREAS OF EXPERTISE"
              options={areasOfExpertise}
              selectedOptions={selectedAreasOfExpertise}
              onToggle={handleAreaToggle}
            />
          )}

          {memberships.length > 0 && (
            <FilterDropdown
              title="MEMBERSHIPS"
              options={memberships}
              selectedOptions={selectedMemberships}
              onToggle={handleMembershipToggle}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}