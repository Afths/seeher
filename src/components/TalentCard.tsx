import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

interface TalentCardProps {
  name: string;
  companyName?: string;
  jobTitle?: string;
  shortBio?: string;
  profilePictureUrl?: string;
  keywords?: string[];
  socialMediaLinks?: any;
  languages?: string[];
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

  const socialLinks = socialMediaLinks || {};

  return (
    <Card 
      className="backdrop-blur-sm bg-card/80 border-border/40 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-border/20">
            <AvatarImage src={profilePictureUrl} alt={name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
            {jobTitle && (
              <p className="text-sm text-muted-foreground mb-1">
                {jobTitle}
                {companyName && ` at ${companyName}`}
              </p>
            )}
            
            {shortBio && (
              <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                {shortBio}
              </p>
            )}
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {keywords.slice(0, 4).map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-xs bg-secondary/50 text-secondary-foreground border-0 rounded-full"
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
              
              <div className="flex gap-2">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}