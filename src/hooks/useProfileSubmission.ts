import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profileSubmissionSchema, sanitizeInput, checkRateLimit } from "@/lib/validation";
import { z } from "zod";

interface FormData {
  name: string;
  email: string;
  jobTitle: string;
  companyName: string;
  shortBio: string;
  longBio: string;
  nationality: string;
  contactNumber: string;
  altContactName: string;
  interestedIn: string[];
  profilePictureUrl: string;
  consent: boolean;
}

export function useProfileSubmission() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    jobTitle: "",
    companyName: "",
    shortBio: "",
    longBio: "",
    nationality: "",
    contactNumber: "",
    altContactName: "",
    interestedIn: [],
    profilePictureUrl: "",
    consent: false,
  });

  const [languages, setLanguages] = useState<string[]>([]);
  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
  const [memberships, setMemberships] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      jobTitle: "",
      companyName: "",
      shortBio: "",
      longBio: "",
      nationality: "",
      contactNumber: "",
      altContactName: "",
      interestedIn: [],
      profilePictureUrl: "",
      consent: false,
    });
    setLanguages([]);
    setAreasOfExpertise([]);
    setMemberships([]);
    setKeywords([]);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent, profilePicture?: File | null) => {
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
      let profilePictureUrl = "";

      // Upload profile picture if provided
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, profilePicture);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        profilePictureUrl = publicUrl;
      }

      // Prepare data for validation
      const submissionData = {
        name: sanitizeInput(formData.name),
        email: formData.email,
        job_title: sanitizeInput(formData.jobTitle),
        company_name: formData.companyName ? sanitizeInput(formData.companyName) : undefined,
        nationality: sanitizeInput(formData.nationality),
        contact_number: formData.contactNumber || undefined,
        alt_contact_name: formData.altContactName ? sanitizeInput(formData.altContactName) : undefined,
        short_bio: sanitizeInput(formData.shortBio),
        long_bio: formData.longBio ? sanitizeInput(formData.longBio) : undefined,
        areas_of_expertise: areasOfExpertise.map(sanitizeInput),
        languages: languages.map(sanitizeInput),
        keywords: keywords.map(sanitizeInput),
        memberships: memberships.map(sanitizeInput),
        interested_in: formData.interestedIn,
        consent: formData.consent
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
          profile_picture_url: profilePictureUrl,
          languages: validatedData.languages,
          areas_of_expertise: validatedData.areas_of_expertise,
          memberships: validatedData.memberships,
          keywords: validatedData.keywords,
          consent: validatedData.consent,
          status: 'PENDING_APPROVAL'
        });

      if (error) throw error;

      return true; // Success
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
      return false; // Failure
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    languages,
    setLanguages,
    areasOfExpertise,
    setAreasOfExpertise,
    memberships,
    setMemberships,
    keywords,
    setKeywords,
    loading,
    errors,
    handleSubmit,
    resetForm,
  };
}