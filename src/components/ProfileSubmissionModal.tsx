import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSubmissionModal({ isOpen, onClose }: ProfileSubmissionModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    companyName: "",
    shortBio: "",
    longBio: "",
    nationality: "",
    contactNumber: "",
    altContactName: "",
    interestedIn: "speaker",
    profilePictureUrl: "",
  });

  const [languages, setLanguages] = useState<string[]>([]);
  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
  const [memberships, setMemberships] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newMembership, setNewMembership] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const addItem = (item: string, list: string[], setList: (list: string[]) => void, setValue: (value: string) => void) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setValue("");
    }
  };

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { error } = await supabase
        .from("women")
        .insert({
          user_id: null, // No user account yet, will be set when approved
          name: formData.name,
          email: formData.email,
          job_title: formData.jobTitle,
          company_name: formData.companyName,
          short_bio: formData.shortBio,
          long_bio: formData.longBio,
          nationality: formData.nationality,
          contact_number: formData.contactNumber,
          alt_contact_name: formData.altContactName,
          interested_in: formData.interestedIn,
          profile_picture_url: formData.profilePictureUrl,
          languages,
          areas_of_expertise: areasOfExpertise,
          memberships,
          keywords,
          consent: true,
          status: 'PENDING_APPROVAL'
        });

      if (error) throw error;

      toast({
        title: "Profile submitted successfully!",
        description: "Your profile is now pending approval and will be reviewed soon.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error submitting profile:", error);
      toast({
        title: "Error submitting profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Your Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortBio">Short Bio</Label>
            <Textarea
              id="shortBio"
              value={formData.shortBio}
              onChange={(e) => setFormData({...formData, shortBio: e.target.value})}
              placeholder="Brief description about yourself..."
            />
          </div>

          <div>
            <Label htmlFor="longBio">Detailed Bio</Label>
            <Textarea
              id="longBio"
              value={formData.longBio}
              onChange={(e) => setFormData({...formData, longBio: e.target.value})}
              placeholder="Detailed description about your background and experience..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <Label>Languages</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newLanguage, languages, setLanguages, setNewLanguage))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(newLanguage, languages, setLanguages, setNewLanguage)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="cursor-pointer">
                  {lang}
                  <X
                    className="w-3 h-3 ml-1"
                    onClick={() => removeItem(lang, languages, setLanguages)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Areas of Expertise */}
          <div>
            <Label>Areas of Expertise</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Add an area of expertise..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newArea, areasOfExpertise, setAreasOfExpertise, setNewArea))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(newArea, areasOfExpertise, setAreasOfExpertise, setNewArea)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {areasOfExpertise.map((area) => (
                <Badge key={area} variant="secondary" className="cursor-pointer">
                  {area}
                  <X
                    className="w-3 h-3 ml-1"
                    onClick={() => removeItem(area, areasOfExpertise, setAreasOfExpertise)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <Label>Keywords</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add a keyword..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newKeyword, keywords, setKeywords, setNewKeyword))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(newKeyword, keywords, setKeywords, setNewKeyword)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="cursor-pointer">
                  {keyword}
                  <X
                    className="w-3 h-3 ml-1"
                    onClick={() => removeItem(keyword, keywords, setKeywords)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}