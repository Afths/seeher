import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/40 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {languages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Languages</h4>
            <div className="space-y-2">
              {languages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={selectedLanguages.includes(language)}
                    onCheckedChange={() => handleLanguageToggle(language)}
                  />
                  <label
                    htmlFor={`lang-${language}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {language}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {areasOfExpertise.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Areas of Expertise</h4>
            <div className="space-y-2">
              {areasOfExpertise.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${area}`}
                    checked={selectedAreasOfExpertise.includes(area)}
                    onCheckedChange={() => handleAreaToggle(area)}
                  />
                  <label
                    htmlFor={`area-${area}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {area}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {memberships.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Memberships</h4>
            <div className="space-y-2">
              {memberships.map((membership) => (
                <div key={membership} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mem-${membership}`}
                    checked={selectedMemberships.includes(membership)}
                    onCheckedChange={() => handleMembershipToggle(membership)}
                  />
                  <label
                    htmlFor={`mem-${membership}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {membership}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}