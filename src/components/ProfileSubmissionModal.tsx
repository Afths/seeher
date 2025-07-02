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
import { ArrayInputField } from "@/components/ArrayInputField";
import { useProfileSubmission } from "@/hooks/useProfileSubmission";

interface ProfileSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSubmissionModal({ isOpen, onClose }: ProfileSubmissionModalProps) {
  const {
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
  } = useProfileSubmission();

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Your Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
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

          <ArrayInputField
            label="Languages"
            placeholder="Add a language..."
            items={languages}
            onItemsChange={setLanguages}
            variant="secondary"
          />

          <ArrayInputField
            label="Areas of Expertise"
            placeholder="Add an area of expertise..."
            items={areasOfExpertise}
            onItemsChange={setAreasOfExpertise}
            variant="secondary"
          />

          <ArrayInputField
            label="Keywords"
            placeholder="Add a keyword..."
            items={keywords}
            onItemsChange={setKeywords}
            variant="outline"
          />

          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
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