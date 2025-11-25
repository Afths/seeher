/**
 * PROFILE SUBMISSION MODAL COMPONENT
 *
 * Allows users to submit new woman professional profiles for review and approval.
 * Provides a comprehensive form with all profile fields including:
 * - Basic info (name, email, job title, company)
 * - Profile picture upload
 * - Biography (short and detailed)
 * - Nationality and contact information
 * - Languages, areas of expertise, keywords
 * - Interest types (speaker, panelist, board member)
 * - Privacy consent checkbox
 *
 * Features:
 * - Form validation with error messages
 * - File upload for profile pictures
 * - Searchable select components for dynamic fields
 * - Success modal after submission
 * - Form reset after successful submission
 * - Loading states during submission
 */

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { NationalitySelect } from "@/components/NationalitySelect";
import { PhoneNumberInput } from "@/components/PhoneNumberInput";
import { SuccessModal } from "@/components/SuccessModal";
import { useProfileSubmission } from "@/hooks/useProfileSubmission";

interface ProfileSubmissionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onProfileSubmitted: () => void;
}

export function ProfileSubmissionModal({
	isOpen,
	onClose,
	onProfileSubmitted,
}: ProfileSubmissionModalProps) {
	// Success modal state - shown after successful submission
	const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

	// Profile picture file state
	const [profilePicture, setProfilePicture] = useState<File | null>(null);

	// Form management hook - handles form state, validation, and submission
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

	/**
	 * Handle form submission
	 * Submits profile data and profile picture, then shows success modal
	 */
	const handleFormSubmit = async (e: React.FormEvent) => {
		const success = await handleSubmit(e, profilePicture);
		if (success) {
			resetForm();
			setProfilePicture(null);
			onClose();
			setShowSuccessModal(true);
			onProfileSubmitted();
		}
	};

	/**
	 * Handle modal close
	 * Resets form and clears profile picture before closing
	 */
	const handleClose = () => {
		resetForm();
		setProfilePicture(null);
		onClose();
	};

	/**
	 * Handle success modal close
	 */
	const handleSuccessModalClose = () => {
		setShowSuccessModal(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl">Submit Your Profile</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="space-y-6">
					{/* Basic Information Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Full Name - Required */}
						<div>
							<Label htmlFor="name">Full Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
								className={errors.name ? "border-destructive" : ""}
							/>
							{errors.name && (
								<p className="text-sm text-destructive mt-1">{errors.name}</p>
							)}
						</div>

						{/* Email - Required - locked to authenticated user's email */}
						<div>
							<Label htmlFor="email">Email *</Label>
							<div className="relative">
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									required
									disabled
									className={`${
										errors.email ? "border-destructive" : ""
									} bg-muted cursor-not-allowed pr-10`}
								/>
								<Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								This email is locked to your account and cannot be changed
							</p>
							{errors.email && (
								<p className="text-sm text-destructive mt-1">{errors.email}</p>
							)}
						</div>

						{/* Job Title - Required */}
						<div>
							<Label htmlFor="jobTitle">Job Title *</Label>
							<Input
								id="jobTitle"
								value={formData.jobTitle}
								onChange={(e) =>
									setFormData({ ...formData, jobTitle: e.target.value })
								}
								required
							/>
						</div>

						{/* Company Name - Optional */}
						<div>
							<Label htmlFor="companyName">Company Name</Label>
							<Input
								id="companyName"
								value={formData.companyName}
								onChange={(e) =>
									setFormData({ ...formData, companyName: e.target.value })
								}
							/>
						</div>
					</div>

					{/* Profile Picture Upload */}
					<div>
						<Label htmlFor="profilePicture">Profile Picture</Label>
						<div className="mt-1">
							<Input
								id="profilePicture"
								type="file"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									setProfilePicture(file || null);
								}}
								className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
							/>
							{profilePicture && (
								<p className="text-sm text-muted-foreground mt-1">
									Selected: {profilePicture.name}
								</p>
							)}
						</div>
					</div>

					{/* Biography Section */}
					{/* Short Bio - Required */}
					<div>
						<Label htmlFor="shortBio">Short Bio *</Label>
						<Textarea
							id="shortBio"
							value={formData.shortBio}
							onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
							placeholder="Brief description about yourself..."
							required
						/>
					</div>

					{/* Detailed Bio - Optional */}
					<div>
						<Label htmlFor="longBio">Detailed Bio</Label>
						<Textarea
							id="longBio"
							value={formData.longBio}
							onChange={(e) => setFormData({ ...formData, longBio: e.target.value })}
							placeholder="Detailed description about your background and experience..."
							rows={4}
						/>
					</div>

					{/* Nationality and Contact Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Nationality - Required, uses standardized country list */}
						<NationalitySelect
							value={formData.nationality}
							onChange={(value) => setFormData({ ...formData, nationality: value })}
							error={errors.nationality}
						/>
						{/* Contact Number - Optional, with country code selector */}
						<PhoneNumberInput
							id="submitContactNumber"
							value={formData.contactNumber}
							onChange={(value) => setFormData({ ...formData, contactNumber: value })}
							error={errors.contact_number}
						/>
					</div>

					{/* Languages - Required, multi-select */}
					<SearchableSelect
						label="Languages *"
						placeholder="Search or add languages..."
						selectedItems={languages}
						onItemsChange={setLanguages}
						variant="secondary"
						field="languages"
					/>

					{/* Areas of Expertise - Required, multi-select */}
					<SearchableSelect
						label="Areas of Expertise *"
						placeholder="Search or add areas of expertise..."
						selectedItems={areasOfExpertise}
						onItemsChange={setAreasOfExpertise}
						variant="secondary"
						field="areas_of_expertise"
					/>

					{/* Memberships - Optional, multi-select */}
					<SearchableSelect
						label="Memberships"
						placeholder="Search or add memberships..."
						selectedItems={memberships}
						onItemsChange={setMemberships}
						variant="outline"
						field="memberships"
					/>

					{/* Keywords - Optional, multi-select */}
					<SearchableSelect
						label="Keywords"
						placeholder="Search or add keywords..."
						selectedItems={keywords}
						onItemsChange={setKeywords}
						variant="outline"
						field="keywords"
					/>

					{/* Interest Types - Required, checkboxes */}
					<div className="space-y-4">
						<Label>Interested In *</Label>
						<div className="space-y-3">
							{["Speaker", "Board Member", "Panelist"].map((role) => (
								<div key={role} className="flex items-center space-x-2">
									<Checkbox
										id={role}
										checked={formData.interestedIn.includes(role)}
										onCheckedChange={(checked) => {
											if (checked) {
												setFormData({
													...formData,
													interestedIn: [...formData.interestedIn, role],
												});
											} else {
												setFormData({
													...formData,
													interestedIn: formData.interestedIn.filter(
														(item) => item !== role
													),
												});
											}
										}}
										className={errors.interested_in ? "border-destructive" : ""}
									/>
									<Label htmlFor={role}>{role}</Label>
								</div>
							))}
						</div>
						{errors.interested_in && (
							<p className="text-sm text-destructive mt-1">{errors.interested_in}</p>
						)}
					</div>

					{/* Privacy Consent - Required */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="consent"
							checked={formData.consent}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, consent: checked as boolean })
							}
							className={errors.consent ? "border-destructive" : ""}
						/>
						<Label htmlFor="consent">
							I agree to the privacy policy and terms and conditions *
						</Label>
						{errors.consent && (
							<p className="text-sm text-destructive ml-6">{errors.consent}</p>
						)}
					</div>

					{/* Form Actions */}
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

			{/* Success modal - shown after successful submission */}
			<SuccessModal isOpen={showSuccessModal} onClose={handleSuccessModalClose} />
		</Dialog>
	);
}
