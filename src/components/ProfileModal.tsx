import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";

type Woman = Tables<"women">;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  woman: Woman | null;
}

export function ProfileModal({ isOpen, onClose, woman }: ProfileModalProps) {
  if (!woman) return null;

  const socialLinks = woman.social_media_links as Record<string, string> | null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{woman.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Photo and Basic Info */}
          <div className="space-y-4">
            <Avatar className="w-32 h-32 mx-auto">
              <AvatarImage src={woman.profile_picture_url || undefined} />
              <AvatarFallback className="text-2xl">
                {woman.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <Card>
              <CardContent className="pt-4 space-y-2">
                {woman.job_title && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Job Title</h4>
                    <p className="text-sm">{woman.job_title}</p>
                  </div>
                )}
                
                {woman.company_name && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                    <p className="text-sm">{woman.company_name}</p>
                  </div>
                )}
                
                {woman.nationality && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Nationality</h4>
                    <p className="text-sm">{woman.nationality}</p>
                  </div>
                )}
                
                {woman.interested_in && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Interested In</h4>
                    <p className="text-sm capitalize">{woman.interested_in}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Columns - Detailed Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio Section */}
            {(woman.short_bio || woman.long_bio) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Biography</h3>
                {woman.short_bio && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Short Bio</h4>
                    <p className="text-sm">{woman.short_bio}</p>
                  </div>
                )}
                {woman.long_bio && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Detailed Bio</h4>
                    <p className="text-sm whitespace-pre-wrap">{woman.long_bio}</p>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Skills and Expertise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {woman.areas_of_expertise && woman.areas_of_expertise.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {woman.areas_of_expertise.map((area) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {woman.languages && woman.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {woman.languages.map((language) => (
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {woman.keywords && woman.keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {woman.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {woman.memberships && woman.memberships.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Memberships</h4>
                  <div className="flex flex-wrap gap-1">
                    {woman.memberships.map((membership) => (
                      <Badge key={membership} variant="outline" className="text-xs">
                        {membership}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {(woman.email || woman.contact_number || woman.alt_contact_name || socialLinks) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {woman.email && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                        <p className="text-sm">{woman.email}</p>
                      </div>
                    )}
                    
                    {woman.contact_number && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                        <p className="text-sm">{woman.contact_number}</p>
                      </div>
                    )}
                    
                    {woman.alt_contact_name && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Alternative Contact</h4>
                        <p className="text-sm">{woman.alt_contact_name}</p>
                      </div>
                    )}
                  </div>
                  
                  {socialLinks && Object.keys(socialLinks).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Social Media</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(socialLinks).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(url, '_blank')}
                            className="text-xs"
                          >
                            {platform}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}