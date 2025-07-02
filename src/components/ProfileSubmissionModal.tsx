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
import { profileSubmissionSchema, sanitizeInput, checkRateLimit } from "@/lib/validation";
import { z } from "zod";

interface ProfileSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSubmissionModal({ isOpen, onClose }: ProfileSubmissionModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    setErrors({});

    // Rate limiting check
    const clientId = `${window.location.hostname}-${Date.now()}`;
    if (!checkRateLimit(clientId, 3, 300000)) { // 3 requests per 5 minutes
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before submitting another profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare data for validation
      const submissionData = {
        name: sanitizeInput(formData.name),
        email: formData.email,
        job_title: formData.jobTitle ? sanitizeInput(formData.jobTitle) : undefined,
        company_name: formData.companyName ? sanitizeInput(formData.companyName) : undefined,
        nationality: formData.nationality ? sanitizeInput(formData.nationality) : undefined,
        contact_number: formData.contactNumber || undefined,
        alt_contact_name: formData.altContactName ? sanitizeInput(formData.altContactName) : undefined,
        short_bio: formData.shortBio ? sanitizeInput(formData.shortBio) : undefined,
        long_bio: formData.longBio ? sanitizeInput(formData.longBio) : undefined,
        areas_of_expertise: areasOfExpertise.map(sanitizeInput),
        languages: languages.map(sanitizeInput),
        keywords: keywords.map(sanitizeInput),
        memberships: memberships.map(sanitizeInput),
        interested_in: [formData.interestedIn] as string[],
        consent: true
      };

      // Validate the data
      const validatedData = profileSubmissionSchema.parse(submissionData);
      const { error } = await supabase
        .from("women")
        .insert({
          user_id: null, // No user account yet, will be set when approved
          name: validatedData.name,
          email: validatedData.email,
          job_title: validatedData.job_title,
          company_name: validatedData.company_name,
          short_bio: validatedData.short_bio,
          long_bio: validatedData.long_bio,
          nationality: validatedData.nationality,
          contact_number: validatedData.contact_number,
          alt_contact_name: validatedData.alt_contact_name,
          interested_in: validatedData.interested_in,
          profile_picture_url: formData.profilePictureUrl,
          languages: validatedData.languages,
          areas_of_expertise: validatedData.areas_of_expertise,
          memberships: validatedData.memberships,
          keywords: validatedData.keywords,
          consent: validatedData.consent,
          status: 'PENDING_APPROVAL'
        });

      if (error) throw error;

      toast({
        title: "Thank you for being here. Your profile is being reviewed. We get in touch as soon as we get to it - typically 1-2 weeks. 🤍",
      });
      
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      } else {
        console.error("Error submitting profile:", error);
        toast({
          title: "Error submitting profile",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
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
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
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
                size="sm"
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
                size="sm"
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
                size="sm"
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
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Submitting..." : "Submit Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}