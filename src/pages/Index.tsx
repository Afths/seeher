/**
 * INDEX PAGE - Main Search & Discovery Page
 *
 * This is the primary page where users can:
 * - Search for women professionals by name, bio, expertise, keywords
 * - Filter by interest type (Speaker, Panelist, Board Member)
 * - Filter by languages, areas of expertise, and memberships
 * - View profile cards and click to see detailed profiles
 * - Submit a profile
 *  - View and edit their profile
 * - Access admin dashboard (if admin)
 * - Sign in/out
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, User, LogOut, X } from "lucide-react";
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

	// Authentication hook (user can be NULL if not logged in)
	const { user, signOut, loading: authLoading } = useAuth();

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
	const [isViewingOwnProfile, setIsViewingOwnProfile] = useState<boolean>(false); // Track if the user is viewing own profile (to show edit button)
	const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false); // Profile submission modal visibility
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // Profile edit modal visibility
	const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false); // Sign in modal visibility
	const [userProfile, setUserProfile] = useState<Woman | null>(null); // Current user's full profile data

	const hasProfile = userProfile !== null;
	const profileStatus = (userProfile?.status as ProfileStatus) ?? null;

	// When a user clicks the resubmit profile link in their (rejection) email but isn't signed in yet,
	// we set a "flag" to remember that after they sign in, we should open the 'Submit Profile' modal.
	// Note: We also use sessionStorage to store the flag, so it survives page refreshes.
	const shouldOpenSubmissionAfterSignIn = useRef<boolean>(false);

	// When a user clicks the view profile link in their (approval) email but isn't signed in yet,
	// we set a "flag" to remember that after they sign in, we should open the "My Profile" modal.
	// Note: We also use sessionStorage to store the flag, so it survives page refreshes.
	const shouldOpenMyProfileAfterSignIn = useRef<boolean>(false);

	/**
	 * Fetch user's profile data (if they have an approved or pending profile)
	 * Note: Not approved profiles are not considered as "having a profile" (so users can resubmit after rejection)
	 */
	const fetchUserProfile = async (): Promise<Woman | null> => {
		if (!user) {
			setUserProfile(null);
			return null;
		}

		// Fetch profile data
		const { data, error } = await supabase
			.from("women")
			.select("*")
			.eq("user_id", user.id)
			.in("status", ["APPROVED", "PENDING_APPROVAL"]) // Only consider approved or pending profiles (not rejected)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) {
			console.error("[Index] ❌ Error fetching user profile:", error);
			setUserProfile(null);
			return null;
		}

		const profileData = data ? (data as Woman) : null;
		setUserProfile(profileData); // Cache profile data

		return profileData;
	};

	/**
	 * Check if authenticated user has a profile (approved or pending)
	 * Used to conditionally show/hide the "Submit Profile" button
	 * Also caches the full profile data for the "My Profile" button (avoids redundant queries)
	 */
	useEffect(() => {
		fetchUserProfile();
	}, [user]);

	/**
	 * Detect when user clicks resubmit link from email
	 *
	 * - Watches for "?resubmit=true" in the URL
	 * - If user is signed in → opens submission modal immediately
	 * - If user is NOT signed in → opens sign-in modal and set flag
	 *
	 * This is the entry point of the resubmit flow. Without this, clicking the resubmit link wouldn't do anything.
	 */
	useEffect(() => {
		const resubmitParam = searchParams.get("resubmit");

		// Important: We must wait for auth to finish loading before checking if user exists.
		// Otherwise, user might be null even if they're signed in (auth state just hasn't loaded yet).
		if (resubmitParam === "true" && !authLoading) {
			// Remove the parameter to clean up the URL
			searchParams.delete("resubmit");
			setSearchParams(searchParams, { replace: true });

			if (user) {
				setIsSubmissionModalOpen(true); // User is already signed in → open submission modal right away
				// Make sure no old flags are lingering around
				shouldOpenSubmissionAfterSignIn.current = false;
				sessionStorage.removeItem("openResubmitAfterSignIn");
			} else {
				setIsSignInModalOpen(true); // Open sign-in modal so user can sign in
				// User is NOT signed in → we need to remember to open submission modal after sign-in
				// We flag this via the ref and sessionStorage
				sessionStorage.setItem("openResubmitAfterSignIn", "true");
				shouldOpenSubmissionAfterSignIn.current = true;
			}
		}
	}, [searchParams, setSearchParams, user, authLoading]);

	/**
	 * Open My Profile modal - displays user's own profile
	 * Only available to authenticated users who have an approved profile
	 */
	const handleOpenMyProfile = useCallback(() => {
		setSelectedWoman(userProfile);
		setIsViewingOwnProfile(true); // Mark as viewing own profile to show edit button
		setIsModalOpen(true);
	}, [userProfile]);

	/**
	 * Detect when user clicks view profile link from approval email
	 *
	 * - Watches for "?viewProfile=true" in the URL
	 * - If user is signed in → opens "My Profile" modal immediately
	 * - If user is NOT signed in → opens sign-in modal and set flag
	 *
	 * This is the entry point of the view profile flow from approval email.
	 */
	useEffect(() => {
		const viewProfileParam = searchParams.get("viewProfile");

		// Important: We must wait for auth to finish loading before checking if user exists.
		// Otherwise, user might be null even if they're signed in (auth state just hasn't loaded yet).
		if (viewProfileParam === "true" && !authLoading) {
			// Remove the parameter to clean up the URL
			searchParams.delete("viewProfile");
			setSearchParams(searchParams, { replace: true });

			if (user && userProfile) {
				// User is already signed in and has a profile → open "My Profile" modal right away
				handleOpenMyProfile();
				// Make sure no old flags are lingering around
				shouldOpenMyProfileAfterSignIn.current = false;
				sessionStorage.removeItem("openMyProfileAfterSignIn");
			} else if (user && !userProfile) {
				// User is signed in but doesn't have a profile yet → wait for profile to load
				// The profile will be fetched by the useEffect that watches user changes
				// We'll handle opening the modal after profile loads in the next useEffect
				shouldOpenMyProfileAfterSignIn.current = true;
				sessionStorage.setItem("openMyProfileAfterSignIn", "true");
			} else {
				// User is NOT signed in → open sign-in modal and set flag
				setIsSignInModalOpen(true);
				sessionStorage.setItem("openMyProfileAfterSignIn", "true");
				shouldOpenMyProfileAfterSignIn.current = true;
			}
		}
	}, [searchParams, setSearchParams, user, authLoading, userProfile, handleOpenMyProfile]);

	/**
	 * Open "My Profile" modal after profile loads (if user came from viewProfile link)
	 *
	 * - Watches for when userProfile becomes available
	 * - Checks if we have the "flag" set (remembering they came from viewProfile link)
	 * - If yes → automatically opens "My Profile" modal
	 */
	useEffect(() => {
		if (authLoading) return;

		// Check if we have the "flag" set (in both the ref and sessionStorage)
		const hasFlagInMemory = shouldOpenMyProfileAfterSignIn.current;
		const hasFlagInStorage = sessionStorage.getItem("openMyProfileAfterSignIn") === "true";

		// Only proceed if the user is signed in, has a profile, we have the flag set, and modal is not already open
		if (
			user &&
			userProfile &&
			(hasFlagInMemory || hasFlagInStorage) &&
			!isModalOpen &&
			!isSignInModalOpen
		) {
			handleOpenMyProfile();
			// Clean up the flags - we've used them, so we don't need them anymore
			shouldOpenMyProfileAfterSignIn.current = false;
			sessionStorage.removeItem("openMyProfileAfterSignIn");
		}
	}, [user, userProfile, authLoading, isModalOpen, isSignInModalOpen, handleOpenMyProfile]);

	/**
	 * Open submission modal after user signs in (if they came from resubmit link)
	 *
	 * - Watches for when a user signs in (user changes from null to a user object)
	 * - Checks if we have the "flag" set (remembering they came from resubmit link)
	 * - If yes → automatically closes sign-in modal and opens submission modal
	 *
	 * This is what allows the automatic transition from the sign-in modal to the submission modal
	 */
	useEffect(() => {
		if (authLoading) return;

		// Check if we have the "flag" set (in both the ref and sessionStorage)
		const hasFlagInMemory = shouldOpenSubmissionAfterSignIn.current;
		const hasFlagInStorage = sessionStorage.getItem("openResubmitAfterSignIn") === "true";

		// Only proceed if the user just signed in, we have the flag set, and the submission modal is not already open
		if (user && (hasFlagInMemory || hasFlagInStorage) && !isSubmissionModalOpen) {
			setIsSignInModalOpen(false); // Close sign-in modal
			setIsSubmissionModalOpen(true); // Open submission modal
			// Clean up the flags - we've used them, so we don't need them anymore
			shouldOpenSubmissionAfterSignIn.current = false;
			sessionStorage.removeItem("openResubmitAfterSignIn");
		}
	}, [user, authLoading, isSubmissionModalOpen]);

	/**
	 * Clean up flag when user signs out
	 *
	 * This prevents the case where the user clicks the resubmit link (flag is set), closes the browser/app without closing the modals, and returns later, signs in normally (not from resubmit link):
	 * Without this cleanup, the old flag might still be set and cause unexpected behavior
	 */

	useEffect(() => {
		if (!user) {
			// User signed out → clean up any lingering flags
			sessionStorage.removeItem("openResubmitAfterSignIn");
			shouldOpenSubmissionAfterSignIn.current = false;
			sessionStorage.removeItem("openMyProfileAfterSignIn");
			shouldOpenMyProfileAfterSignIn.current = false;
		}
	}, [user]);

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
		setIsViewingOwnProfile(false);
	};

	/**
	 * Open the profile submission modal
	 * Only available to authenticated users who don't have a profile yet
	 */
	const handleOpenSubmissionModal = () => {
		setIsSubmissionModalOpen(true);
	};

	/**
	 * Close the profile submission modal and clean up any resubmit flags that might be lingering
	 */
	const handleCloseSubmissionModal = () => {
		setIsSubmissionModalOpen(false);
		// Clean up resubmit flag when modal is closed manually
		sessionStorage.removeItem("openResubmitAfterSignIn");
		shouldOpenSubmissionAfterSignIn.current = false;
	};

	/**
	 * Handle profile update
	 * This refreshes the cached profile data and reopens the profile modal (after editing) to show the updated profile
	 */
	const handleProfileUpdated = async () => {
		// Refresh the cached profile data
		const updatedProfile = await fetchUserProfile();

		// Update the modal to show the updated profile
		setSelectedWoman(updatedProfile);
		setIsViewingOwnProfile(true);
		setIsModalOpen(true);
	};

	/**
	 * Open the profile edit modal
	 * Only available to authenticated users who have submitted a profile
	 */
	const handleOpenEditModal = () => {
		setIsModalOpen(false); // Close profile modal first
		setIsEditModalOpen(true); // Then open edit modal
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
								{/* Submit Profile button shown when user is :
								- Signed out or
								- Signed in and has not submitted a profile yet OR their submission is pending */}
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
										{/* When user is not signed in */}
										{!user && (
											<TooltipContent>
												<p>
													You need to sign up in order to submit a profile
												</p>
											</TooltipContent>
										)}
										{/* When user's signed in and their profile is under review */}
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
										{/* My Profile button - shown when user is signed in and has an APPROVED profile */}
										{profileStatus === "APPROVED" && (
											<Button
												variant="default"
												size="sm"
												className="rounded-xl"
												onClick={handleOpenMyProfile}
											>
												<User className="w-4 h-4 mr-2" />
												My Profile
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
							<TabsList className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-xl p-1">
								<TabsTrigger
									value="all"
									className="rounded-lg text-sm font-medium uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
								>
									ALL
								</TabsTrigger>
								<TabsTrigger
									value="Speaker"
									className="rounded-lg text-sm font-medium uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
								>
									SPEAKER
								</TabsTrigger>
								<TabsTrigger
									value="Panelist"
									className="rounded-lg text-sm font-medium uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
								>
									PANELIST
								</TabsTrigger>
								<TabsTrigger
									value="Board Member"
									className="rounded-lg text-sm font-medium uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
									className={`bg-card/50 backdrop-blur-sm border-primary/30 rounded-xl pl-4 ${
										searchInput ? "pr-20" : "pr-12"
									}`}
								/>
								{/* Clear button (X) - shown when there's text in the input */}
								{searchInput && (
									<button
										type="button"
										onClick={() => {
											setSearchInput("");
											// Clear the search term in filters and trigger search
											setFilters((prev) => ({
												...prev,
												searchTerm: "",
											}));
										}}
										className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
										aria-label="Clear search"
									>
										<X className="w-4 h-4" />
									</button>
								)}
								{/* Search icon positioned on the right */}
								<Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							</div>
							{/* Search button - triggers search when clicked */}
							{/* Disabled when loading */}
							<Button
								onClick={handleSearch}
								size="sm"
								className="rounded-xl px-6"
								disabled={loading}
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
									<span className="text-primary font-semibold">
										{results.length}
									</span>{" "}
									{results.length === 1 ? "result" : "results"} found
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
			{selectedWoman && (
				<ProfileModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					woman={selectedWoman}
					onEditClick={isViewingOwnProfile ? handleOpenEditModal : undefined} // Only pass edit callback when viewing own profile
				/>
			)}

			{/* Profile submission modal - allows users to submit new profiles */}
			<ProfileSubmissionModal
				isOpen={isSubmissionModalOpen}
				onClose={handleCloseSubmissionModal}
				onProfileSubmitted={fetchUserProfile} // Refresh cached profile after submission
			/>

			{/* Profile edit modal - allows authenticated users to edit their own profile */}
			<ProfileEditModal
				isOpen={isEditModalOpen}
				onClose={handleCloseEditModal}
				onNoProfileFound={handleOpenSubmissionModal} // If user has no profile, open profile submission modal instead
				onProfileUpdated={handleProfileUpdated} // Refresh cached profile and reopen modal with updated data
			/>

			{/* Sign in modal - authentication modal */}
			<SignInModal isOpen={isSignInModalOpen} onClose={handleCloseSignInModal} />
		</div>
	);
};
export default Index;
