/**
 * SEARCH FILTERS COMPONENT
 *
 * Provides advanced filtering options for the talent search functionality.
 * Allows users to filter profiles by:
 * - Languages (multi-select)
 * - Areas of Expertise (multi-select)
 * - Memberships (multi-select)
 *
 * Features:
 * - Dropdown menus with checkboxes for each filter type
 * - Visual badges showing selected filters
 * - "OR" logic between selected items (shows profiles matching ANY selected item)
 * - Click badges to remove filters
 * - Responsive grid layout (1 column on mobile, 3 columns on desktop)
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface SearchFiltersProps {
	languages: string[];
	areasOfExpertise: string[];
	memberships: string[];
	selectedLanguages: string[];
	selectedAreasOfExpertise: string[];
	selectedMemberships: string[];
	onLanguageChange: (languages: string[]) => void;
	onAreasOfExpertiseChange: (areas: string[]) => void;
	onMembershipsChange: (memberships: string[]) => void;
}

export function SearchFilters({
	languages,
	areasOfExpertise,
	memberships,
	selectedLanguages,
	selectedAreasOfExpertise,
	selectedMemberships,
	onLanguageChange,
	onAreasOfExpertiseChange,
	onMembershipsChange,
}: SearchFiltersProps) {
	/**
	 * Handle toggling a language filter
	 * Adds language if not selected, removes if already selected
	 */
	const handleLanguageToggle = (language: string) => {
		const updatedLanguages = selectedLanguages.includes(language)
			? selectedLanguages.filter((l) => l !== language)
			: [...selectedLanguages, language];
		onLanguageChange(updatedLanguages);
	};

	/**
	 * Handle toggling an area of expertise filter
	 * Adds area if not selected, removes if already selected
	 */
	const handleAreaToggle = (area: string) => {
		const updatedAreasOfExpertise = selectedAreasOfExpertise.includes(area)
			? selectedAreasOfExpertise.filter((a) => a !== area)
			: [...selectedAreasOfExpertise, area];
		onAreasOfExpertiseChange(updatedAreasOfExpertise);
	};

	/**
	 * Handle toggling a membership filter
	 * Adds membership if not selected, removes if already selected
	 */
	const handleMembershipToggle = (membership: string) => {
		const updatedMemberships = selectedMemberships.includes(membership)
			? selectedMemberships.filter((m) => m !== membership)
			: [...selectedMemberships, membership];
		onMembershipsChange(updatedMemberships);
	};

	/**
	 * Reusable dropdown component for filter selection
	 * Displays a button showing selected count, dropdown with checkboxes, and selected badges
	 */
	const FilterDropdown = ({
		title,
		options,
		selectedOptions,
		onToggle,
	}: {
		title: string;
		options: string[];
		selectedOptions: string[];
		onToggle: (option: string) => void;
	}) => (
		<div>
			{/* Dropdown trigger button - shows filter title or count of selected items */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-between bg-background/50 border-primary/30"
					>
						<span className="text-xs font-medium">
							{selectedOptions.length === 0
								? title
								: `${selectedOptions.length} selected`}
						</span>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				{/* Dropdown content with checkbox list */}
				<DropdownMenuContent
					className="w-64 max-h-96 overflow-y-auto bg-background border-primary/30"
					align="start"
				>
					<div className="p-2 space-y-2">
						{options.map((option) => (
							<div key={option} className="flex items-center space-x-2">
								<Checkbox
									id={`${title.toLowerCase()}-${option}`}
									checked={selectedOptions.includes(option)}
									onCheckedChange={() => onToggle(option)}
								/>
								<label
									htmlFor={`${title.toLowerCase()}-${option}`}
									className="text-sm text-foreground cursor-pointer flex-1"
								>
									{option}
								</label>
							</div>
						))}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
			{/* Selected filter badges - click to remove */}
			{selectedOptions.length > 0 && (
				<div className="flex flex-wrap items-center gap-1 mt-2">
					{selectedOptions.map((option, index) => (
						<div key={option} className="flex items-center gap-1">
							<Badge
								variant="secondary"
								className="text-xs cursor-pointer bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
								onClick={() => onToggle(option)}
							>
								{option} ×
							</Badge>
							{/* "OR" separator between multiple selections */}
							{index < selectedOptions.length - 1 && (
								<span className="text-xs text-muted-foreground font-medium">
									OR
								</span>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);

	return (
		<Card className="backdrop-blur-sm bg-card/80 border-primary/30 rounded-2xl">
			<CardContent className="pt-6">
				{/* Responsive grid: 1 column on mobile, 3 columns on desktop */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Languages filter dropdown */}
					{languages.length > 0 && (
						<FilterDropdown
							title="LANGUAGES"
							options={languages}
							selectedOptions={selectedLanguages}
							onToggle={handleLanguageToggle}
						/>
					)}

					{/* Areas of Expertise filter dropdown */}
					{areasOfExpertise.length > 0 && (
						<FilterDropdown
							title="AREAS OF EXPERTISE"
							options={areasOfExpertise}
							selectedOptions={selectedAreasOfExpertise}
							onToggle={handleAreaToggle}
						/>
					)}

					{/* Memberships filter dropdown */}
					{memberships.length > 0 && (
						<FilterDropdown
							title="MEMBERSHIPS"
							options={memberships}
							selectedOptions={selectedMemberships}
							onToggle={handleMembershipToggle}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
