import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin } from "lucide-react";

interface TalentCardProps {
  name: string;
  companyName?: string;
  jobTitle?: string;
  shortBio?: string;
  profilePictureUrl?: string;
  keywords?: string[];
  socialMediaLinks?: any;
  languages?: string[];
  areasOfExpertise?: string[];
  onClick?: () => void;
}

export function TalentCard({
  name,
  companyName,
  jobTitle,
  shortBio,
  profilePictureUrl,
  keywords = [],
  socialMediaLinks,
  languages = [],
  areasOfExpertise = [],
  onClick
}: TalentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatName = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getPastelColor = (name: string) => {
    const colors = [
      'hsl(25, 50%, 85%)',   // pastel orange
      'hsl(350, 50%, 85%)',  // pastel pink  
      'hsl(270, 50%, 85%)',  // pastel violet
      'hsl(120, 40%, 85%)'   // pastel green
    ];
    
    // Use name to generate consistent color for same person
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const baseColor = colors[Math.abs(hash) % colors.length];
    // Convert to 30% opacity by adjusting the alpha
    return baseColor.replace('hsl(', 'hsla(').replace(')', ', 0.3)');
  };

  const socialLinks = socialMediaLinks || {};

  return (
    <Card 
      className="backdrop-blur-sm bg-card/80 border-border/40 rounded-2xl hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 ease-out cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-40 h-40 flex-shrink-0">
            <Avatar className="w-full h-full border-2 border-border/20">
              <AvatarImage src={profilePictureUrl} alt={name} className="object-cover" />
              <AvatarFallback 
                className="text-2xl font-medium text-foreground"
                style={{ backgroundColor: getPastelColor(name) }}
              >
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-semibold text-foreground">{formatName(name)}</h3>
              {socialLinks.raw && socialLinks.raw.includes('linkedin.com') && (
                <a
                  href={socialLinks.raw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300 ease-out ml-2"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {(jobTitle || companyName) && (
              <p className="text-sm text-muted-foreground mb-2">
                {jobTitle 
                  ? `${jobTitle}${companyName ? ` at ${companyName}` : ''}`
                  : `at ${companyName}`
                }
              </p>
            )}

            {areasOfExpertise.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {areasOfExpertise.slice(0, 3).map((area, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-xs bg-secondary/50 text-secondary-foreground border-0 rounded-full"
                  >
                    {area}
                  </Badge>
                ))}
                {areasOfExpertise.length > 3 && (
                  <Badge variant="outline" className="text-xs rounded-full">
                    +{areasOfExpertise.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {shortBio && (
              <p className="text-sm text-foreground/80 mb-3 line-clamp-3">
                {shortBio}
              </p>
            )}
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {keywords.slice(0, 4).map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="text-xs rounded-full"
                  >
                    {keyword}
                  </Badge>
                ))}
                {keywords.length > 4 && (
                  <Badge variant="outline" className="text-xs rounded-full">
                    +{keywords.length - 4}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {languages.length > 0 && (
                <div className="flex gap-1">
                  {languages.slice(0, 3).map((lang, index) => (
                    <span key={index} className="text-xs bg-accent px-2 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}