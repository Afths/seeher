/**
 * INDEX PAGE - Main Search & Discovery Page
 *
 * This is the primary page where users can:
 * - Search for women professionals by name, bio, expertise, keywords
 * - Filter by interest type (Speaker, Panelist, Board Member)
 * - Filter by languages, areas of expertise, and memberships
 * - View profile cards and click to see detailed profiles
 * - Submit new profiles
 * - Sign in/out
 * - Access admin dashboard (if admin)
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TalentCard } from "@/components/TalentCard";
import { SearchFilters } from "@/components/SearchFilters";
import { ProfileModal } from "@/components/ProfileModal";
import { ProfileSubmissionModal } from "@/components/ProfileSubmissionModal";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { SignInModal } from "@/components/SignInModal";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Woman, WomanPublic, ProfileStatus } from "@/types/database";

const Index = () => {
	// React Router navigation hook for client-side navigation
	const navigate = useNavigate();

	// Get URL search parameters for deep linking (e.g., ?resubmit=true)
	const [searchParams, setSearchParams] = useSearchParams();

	// Authentication hook - provides current user and sign out function
	// Note: user can be NULL if not logged in
	const { user, signOut } = useAuth();

	// Check if current user has admin privileges
	const { isAdmin } = useIsAdmin();

	// Handles all search logic, filtering, and results management
	const {
		results, // Array of matching profiles
		loading, // Whether search is in progress
		filters, // Current filter state (languages, expertise, etc.)
		setFilters, // Function to update filters
		allLanguages, // All available languages for filter dropdown
		allAreasOfExpertise, // All available expertise areas for filter dropdown
		allMemberships, // All available memberships for filter dropdown
	} = useTalentSearch();

	const [searchInput, setSearchInput] = useState<string>(""); // Text input for search
	const [selectedWoman, setSelectedWoman] = useState<Woman | null>(null); // Selected profile for modal
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Profile detail modal visibility
	const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false); // Profile submission modal visibility
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // Profile edit modal visibility
	const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false); // Sign in modal visibility
	const [hasProfile, setHasProfile] = useState<boolean>(false); // Whether the current (signed in) user has a profile (approved or pending)
	const [profileStatus, setProfileStatus] = useState<ProfileStatus>(null); // Current profile status (APPROVED, PENDING_APPROVAL, NOT_APPROVED or null)

	/**
	 * Check if authenticated user has a profile (approved or pending)
	 * Used to conditionally show/hide the "Submit Profile" button
	 * Note: Rejected profiles (NOT_APPROVED) are not considered as "having a profile" so users can resubmit after rejection
	 */
	useEffect(() => {
		const checkUserProfile = async () => {
			if (!user) {
				setHasProfile(false);
				setProfileStatus(null);
				return;
			}

			const { data, error } = await supabase
				.from("women")
				.select("id, status")
				.eq("user_id", user.id)
				.in("status", ["APPROVED", "PENDING_APPROVAL"]) // Only consider approved or pending profiles
				.maybeSingle();

			if (error) {
				console.error("[Index] ❌ Error checking user profile:", error);
				setHasProfile(false);
				setProfileStatus(null);
				return;
			}

			setHasProfile(!!data);
			setProfileStatus(data ? (data.status as ProfileStatus) : null);
		};

		checkUserProfile();
	}, [user]);

	/**
	 * Handle URL parameter for resubmitting profile from profile rejection email link
	 * Checks for ?resubmit=true in URL and opens the submission modal
	 * Clears the parameter from URL after handling
	 */
	useEffect(() => {
		const resubmitParam = searchParams.get("resubmit");
		if (resubmitParam === "true") {
			// Open the submission modal
			setIsSubmissionModalOpen(true);
			// Remove the parameter from URL to clean up the address bar
			searchParams.delete("resubmit");
			setSearchParams(searchParams, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	/**
	 * Handle clicking on a talent card
	 * Fetches the full profile (including sensitive fields) and opens the detail modal
	 */
	const handleCardClick = async (woman: WomanPublic) => {
		// Fetch full profile data (including sensitive fields) for modal display
		const { data: fullProfile, error } = await supabase
			.from("women")
			.select("*")
			.eq("id", woman.id)
			.single();

		if (error) {
			console.error("[Index] ❌ Error fetching full profile:", error);
			return;
		}

		setSelectedWoman(fullProfile);
		setIsModalOpen(true);
	};

	/**
	 * Close the profile detail modal and clear selected profile
	 */
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedWoman(null);
	};

	/**
	 * Open the profile submission modal
	 * Only available to authenticated users who don't have a profile yet
	 */
	const handleOpenSubmissionModal = () => {
		setIsSubmissionModalOpen(true);
	};

	/**
	 * Close the profile submission modal
	 */
	const handleCloseSubmissionModal = () => {
		setIsSubmissionModalOpen(false);
	};

	/**
	 * Open the profile edit modal
	 * Only available to authenticated users who have submitted a profile
	 */
	const handleOpenEditModal = () => {
		setIsEditModalOpen(true);
	};

	/**
	 * Close the profile edit modal
	 */
	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
	};

	/**
	 * Open the sign in modal
	 */
	const handleOpenSignInModal = () => {
		setIsSignInModalOpen(true);
	};

	/**
	 * Close the sign in modal
	 */
	const handleCloseSignInModal = () => {
		setIsSignInModalOpen(false);
	};

	/**
	 * Handle search button click
	 * Updates the search filter with the current input value
	 */
	const handleSearch = () => {
		setFilters((prev) => ({
			...prev,
			searchTerm: searchInput,
		}));
	};

	/**
	 * Handle Enter key press in search input
	 * Triggers search when user presses Enter
	 */
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	/**
	 * Handle tab change (All, Speaker, Panelist, Board Member)
	 * Updates the interestedIn filter
	 */
	const handleTabChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			interestedIn: value,
		}));
	};

	/**
	 * Handle languages filter change
	 * Updates the languages filter array
	 */
	const handleLanguagesChange = (languages: string[]) => {
		setFilters((prev) => ({
			...prev,
			languages,
		}));
	};

	/**
	 * Handle areas of expertise filter change
	 * Updates the areasOfExpertise filter array
	 */
	const handleAreasOfExpertiseChange = (areas: string[]) => {
		setFilters((prev) => ({
			...prev,
			areasOfExpertise: areas,
		}));
	};

	/**
	 * Handle memberships filter change
	 * Updates the memberships filter array
	 */
	const handleMembershipsChange = (memberships: string[]) => {
		setFilters((prev) => ({
			...prev,
			memberships,
		}));
	};

	return (
		<div className="min-h-screen bg-background">
			{/* HEADER SECTION */}
			{/* Contains logo, navigation, and user actions */}
			<div className="bg-gradient-to-r from-background via-accent/30 to-background border-b border-border/40">
				<div className="container mx-auto px-6 py-[10px]">
					<div className="flex items-center justify-between">
						{/* Left spacer for centering */}
						<div className="flex-1" />

						{/* Logo - centered */}
						<div className="flex items-center">
							<img
								src="/lovable-uploads/c78fd2de-1860-470e-826c-241b2a3a2f4f.png"
								alt="SeeHer Logo"
								className="h-16"
							/>
						</div>

						{/* Right side: User actions */}
						<div className="flex-1 flex justify-end">
							<div className="flex items-center gap-4">
								{/* Submit Profile button - shown when user has not submitted a profile yet OR when their submission is pending */}
								{(!hasProfile || profileStatus === "PENDING_APPROVAL") && (
									<Tooltip>
										<TooltipTrigger asChild>
											<span>
												<Button
													onClick={handleOpenSubmissionModal}
													size="sm"
													className="rounded-xl"
													disabled={
														!user ||
														profileStatus === "PENDING_APPROVAL"
													} // Disabled if user is not signed in OR profile is under review
												>
													Submit Profile
												</Button>
											</span>
										</TooltipTrigger>
										{!user && (
											<TooltipContent>
												<p>
													You need to sign up in order to submit a profile
												</p>
											</TooltipContent>
										)}
										{profileStatus === "PENDING_APPROVAL" && (
											<TooltipContent>
												<p>
													You have already submitted a profile and it is
													currently under review
												</p>
											</TooltipContent>
										)}
									</Tooltip>
								)}

								{/* Conditional rendering based on authentication state */}
								{user ? (
									<>
										{/* Edit My Profile button - visible when user is logged in AND has an APPROVED profile */}
										{profileStatus === "APPROVED" && (
											<Button
												variant="secondary"
												size="sm"
												className="rounded-xl"
												onClick={handleOpenEditModal}
											>
												<User className="w-4 h-4 mr-2" />
												Edit My Profile
											</Button>
										)}
										{/* Admin Dashboard button - only visible to admins */}
										{isAdmin && (
											<Button
												variant="secondary"
												size="sm"
												className="rounded-xl"
												onClick={() => navigate("/admin")}
											>
												Admin Dashboard
											</Button>
										)}
										{/* Sign Out button - visible when user is logged in */}
										<Button
											variant="outline"
											onClick={signOut}
											size="sm"
											className="rounded-xl"
										>
											<LogOut className="w-4 h-4 mr-2" />
											Sign Out
										</Button>
									</>
								) : (
									/* Sign In button - visible when user is not logged in */
									<Button
										variant="outline"
										onClick={handleOpenSignInModal}
										size="sm"
										className="rounded-xl"
									>
										Sign In
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* MAIN CONTENT AREA */}
			<div className="container mx-auto px-6 py-8">
				{/* SEARCH CONTROLS SECTION */}
				<div className="mb-8 space-y-6">
					{/* Interest Type Tabs - Filter by what the professional is interested in */}
					{/* Options: All, Speaker, Panelist, Board Member */}
					<div className="flex justify-center">
						<Tabs value={filters.interestedIn} onValueChange={handleTabChange}>
							<TabsList className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-1">
								<TabsTrigger
									value="all"
									className="rounded-lg text-sm font-medium uppercase"
								>
									ALL
								</TabsTrigger>
								<TabsTrigger
									value="Speaker"
									className="rounded-lg text-sm font-medium uppercase"
								>
									SPEAKER
								</TabsTrigger>
								<TabsTrigger
									value="Panelist"
									className="rounded-lg text-sm font-medium uppercase"
								>
									PANELIST
								</TabsTrigger>
								<TabsTrigger
									value="Board Member"
									className="rounded-lg text-sm font-medium uppercase"
								>
									BOARD MEMBER
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* Search Input Box - Full width search bar */}
					<div className="w-full">
						<div className="flex gap-4">
							<div className="flex-1 relative">
								{/* Search input with icon */}
								<Input
									placeholder="Search by name, bio, expertise, keywords..."
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									onKeyPress={handleKeyPress}
									className="bg-card/50 backdrop-blur-sm border-border/40 rounded-xl pl-4 pr-12"
								/>
								{/* Search icon positioned on the right */}
								<Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							</div>
							{/* Search button - triggers search when clicked */}
							{/* Disabled when input is empty or while loading */}
							<Button
								onClick={handleSearch}
								size="sm"
								className="rounded-xl px-6"
								// Disable button when loading or input is empty
								disabled={loading || !searchInput.trim()}
							>
								Search
							</Button>
						</div>
					</div>
				</div>

				{/* ADVANCED FILTERS SECTION */}
				{/* Filter by languages, areas of expertise, and memberships */}
				<div className="mb-8">
					<SearchFilters
						languages={allLanguages}
						areasOfExpertise={allAreasOfExpertise}
						memberships={allMemberships}
						selectedLanguages={filters.languages}
						selectedAreasOfExpertise={filters.areasOfExpertise}
						selectedMemberships={filters.memberships}
						onLanguageChange={handleLanguagesChange}
						onAreasOfExpertiseChange={handleAreasOfExpertiseChange}
						onMembershipsChange={handleMembershipsChange}
					/>
				</div>

				{/* SEARCH RESULTS SECTION */}
				<div>
					{loading ? (
						/* Loading state - show spinner while searching */
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-muted-foreground mt-4">Searching...</p>
						</div>
					) : (
						/* Results display */
						<div className="space-y-4">
							{/* Results count */}
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									{results.length} {results.length === 1 ? "result" : "results"}{" "}
									found
								</p>
							</div>

							{/* Grid of talent cards - responsive: 1 column on mobile, 2 columns on XL screens */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
								{results.map((person) => (
									<TalentCard
										key={person.id}
										name={person.name}
										companyName={person.company_name}
										jobTitle={person.job_title}
										shortBio={person.short_bio}
										profilePictureUrl={person.profile_picture_url}
										keywords={person.keywords || []}
										socialMediaLinks={person.social_media_links}
										languages={person.languages || []}
										areasOfExpertise={person.areas_of_expertise || []}
										onClick={() => handleCardClick(person)}
									/>
								))}
							</div>

							{/* Empty state - shown when no results match the search/filters */}
							{results.length === 0 && (
								<div className="text-center py-12">
									<p className="text-muted-foreground">
										No results found. Try adjusting your search or filters.
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* MODALS */}
			{/* Profile detail modal - shows full profile when a card is clicked */}
			<ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} woman={selectedWoman} />

			{/* Profile submission modal - allows users to submit new profiles */}
			<ProfileSubmissionModal
				isOpen={isSubmissionModalOpen}
				onClose={handleCloseSubmissionModal}
				onProfileSubmitted={() => {
					// Update state when profile is successfully submitted
					setHasProfile(true);
					setProfileStatus("PENDING_APPROVAL"); // Set status to pending so button shows as disabled with tooltip
				}}
			/>

			{/* Profile edit modal - allows authenticated users to edit their own profile */}
			<ProfileEditModal
				isOpen={isEditModalOpen}
				onClose={handleCloseEditModal}
				onNoProfileFound={handleOpenSubmissionModal} // If user has no profile, open profile submission modal instead
			/>

			{/* Sign in modal - authentication modal */}
			<SignInModal isOpen={isSignInModalOpen} onClose={handleCloseSignInModal} />
		</div>
	);
};
export default Index;
