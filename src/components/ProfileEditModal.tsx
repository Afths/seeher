/**
 * PROFILE EDIT MODAL COMPONENT
 *
 * Allows authenticated users to edit their own profile.
 * Pre-populates form with existing profile data and allows updates.
 *
 * Features:
 * - Fetches user's existing profile data
 * - Pre-populates all form fields
 * - Updates profile (not creates new one)
 * - Profile picture upload/replacement
 * - Form validation with error messages
 * - Loading states during fetch and update
 * - Success notification after update
 *
 * Security:
 * - Only accessible to authenticated users
 * - Only fetches/updates profiles where user_id matches authenticated user
 * - Database RLS policies enforce security at database level
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { NationalitySelect } from "@/components/NationalitySelect";
import { PhoneNumberInput } from "@/components/PhoneNumberInput";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import { Loader2, Lock } from "lucide-react";

interface ProfileEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	onNoProfileFound: () => void;
	onProfileUpdated?: () => void; // Optional callback when profile is successfully updated
}

export function ProfileEditModal({
	isOpen,
	onClose,
	onNoProfileFound,
	onProfileUpdated,
}: ProfileEditModalProps) {
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [removePicture, setRemovePicture] = useState<boolean>(false);

	// Profile editing hook - handles fetching and updating profile
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
		loadingProfile,
		errors,
		fetchProfile,
		handleUpdate,
		resetForm,
	} = useProfileEdit();

	/**
	 * Fetch profile data when modal opens
	 * If no profile is found, closes edit modal and opens submission modal instead
	 */
	useEffect(() => {
		if (isOpen) {
			const loadProfile = async () => {
				const profileFound = await fetchProfile();
				// If no profile found, close edit modal and open submission modal
				if (!profileFound && onNoProfileFound) {
					onClose();
					onNoProfileFound();
				} else {
					// Reset remove picture flag when profile is loaded
					setRemovePicture(false);
					setProfilePicture(null);
				}
			};
			loadProfile();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	/**
	 * Handle form submission
	 * Updates existing profile with new data
	 */
	const handleFormSubmit = async (e: React.FormEvent) => {
		const success = await handleUpdate(e, profilePicture, removePicture);
		if (success) {
			setProfilePicture(null);
			setRemovePicture(false);
			onClose();

			// Notify parent component that profile was updated, so it can refresh the cached profile data to show the updated profile when the profile modal is reopened
			if (onProfileUpdated) {
				onProfileUpdated();
			}
		}
	};

	/**
	 * Handle modal close
	 * Resets form and clears profile picture before closing
	 */
	const handleClose = () => {
		resetForm();
		setProfilePicture(null);
		setRemovePicture(false);
		onClose();
	};

	// Show loading state while fetching profile
	if (loadingProfile) {
		return (
			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="max-w-md">
					<div className="flex flex-col items-center justify-center py-8">
						<Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
						<p className="text-muted-foreground">Loading your profile...</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl">Edit Your Profile</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="space-y-6">
					{/* Basic Information Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Full Name - Required */}
						<div>
							<Label htmlFor="edit-name">Full Name *</Label>
							<Input
								id="edit-name"
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
							<Label htmlFor="edit-email">Email *</Label>
							<div className="relative">
								<Input
									id="edit-email"
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
							<Label htmlFor="edit-jobTitle">Job Title *</Label>
							<Input
								id="edit-jobTitle"
								value={formData.jobTitle}
								onChange={(e) =>
									setFormData({ ...formData, jobTitle: e.target.value })
								}
								required
							/>
						</div>

						{/* Company Name - Optional */}
						<div>
							<Label htmlFor="edit-companyName">Company Name</Label>
							<Input
								id="edit-companyName"
								value={formData.companyName}
								onChange={(e) =>
									setFormData({
										...formData,
										companyName: e.target.value,
									})
								}
							/>
						</div>
					</div>

					{/* Profile Picture Upload */}
					<div>
						<Label htmlFor="edit-profilePicture">Profile Picture</Label>
						<div className="mt-1 space-y-2">
							{formData.profilePictureUrl && !removePicture && (
								<div className="flex items-center gap-2 mb-2">
									<img
										src={formData.profilePictureUrl}
										alt="Current profile picture"
										className="w-16 h-16 rounded-full object-cover border border-border"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() => {
											setRemovePicture(true);
											setProfilePicture(null);
											// Clear the file input
											const fileInput = document.getElementById(
												"edit-profilePicture"
											) as HTMLInputElement;
											if (fileInput) {
												fileInput.value = "";
											}
										}}
									>
										Remove Picture
									</Button>
								</div>
							)}
							<Input
								id="edit-profilePicture"
								type="file"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									setProfilePicture(file || null);
									// If user selects a new file, cancel the remove action
									if (file) {
										setRemovePicture(false);
									}
								}}
								className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
							/>
							{profilePicture && (
								<p className="text-sm text-muted-foreground mt-1">
									New picture selected: {profilePicture.name}
								</p>
							)}
							{removePicture && !profilePicture && (
								<p className="text-sm text-destructive mt-1">
									Picture will be removed when you save.
								</p>
							)}
							{formData.profilePictureUrl && !profilePicture && !removePicture && (
								<p className="text-sm text-muted-foreground mt-1">
									Current picture will be kept. Upload a new file to replace it.
								</p>
							)}
						</div>
					</div>

					{/* Biography Section */}
					{/* Short Bio - Required */}
					<div>
						<Label htmlFor="edit-shortBio">Short Bio *</Label>
						<Textarea
							id="edit-shortBio"
							value={formData.shortBio}
							onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
							placeholder="Brief description about yourself..."
							required
						/>
					</div>

					{/* Detailed Bio - Optional */}
					<div>
						<Label htmlFor="edit-longBio">Detailed Bio</Label>
						<Textarea
							id="edit-longBio"
							value={formData.longBio}
							onChange={(e) =>
								setFormData({
									...formData,
									longBio: e.target.value,
								})
							}
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
							id="editContactNumber"
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
										id={`edit-${role}`}
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
									<Label htmlFor={`edit-${role}`}>{role}</Label>
								</div>
							))}
						</div>
						{errors.interested_in && (
							<p className="text-sm text-destructive mt-1">{errors.interested_in}</p>
						)}
					</div>

					{/* Form Actions */}
					<div className="flex gap-4 pt-6">
						<Button type="button" variant="outline" size="sm" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" size="sm" disabled={loading}>
							{loading ? "Updating..." : "Update Profile"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
