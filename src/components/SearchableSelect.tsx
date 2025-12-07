/**
 * SEARCHABLE SELECT COMPONENT
 *
 * A reusable multi-select component with search functionality.
 * Used for selecting languages, areas of expertise, and memberships.
 *
 * Features:
 * - Search/filter options
 * - Add new custom values by typing and pressing Enter (for areas_of_expertise)
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close dropdown
 * - Visual badges for selected items
 * - Language flags for language selections
 *
 * Supports multiple field types:
 * - languages: Array of strings (multi-select) - predefined list (`src/lib/constants.ts`)
 * - areas_of_expertise: Array of strings (multi-select) - fetches from database, allows custom
 * - memberships: Array of strings (multi-select) - predefined list (`src/lib/constants.ts`)
 */

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLanguageFlag } from "@/lib/languageFlags";
import { LANGUAGES, MEMBERSHIPS } from "@/lib/constants";

interface SearchableSelectProps {
	label: string;
	placeholder: string;
	selectedItems: string[];
	onItemsChange: (items: string[]) => void;
	variant?: "secondary" | "outline";
	field: "languages" | "areas_of_expertise" | "memberships";
}

export function SearchableSelect({
	label,
	placeholder,
	selectedItems,
	onItemsChange,
	variant = "secondary",
	field,
}: SearchableSelectProps) {
	// Search input state
	const [searchTerm, setSearchTerm] = useState("");

	// Available options fetched from database
	const [availableOptions, setAvailableOptions] = useState<string[]>([]);

	// Filtered options based on search term
	const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

	// Dropdown open/close state
	const [isOpen, setIsOpen] = useState(false);

	// Keyboard navigation - highlighted option index
	const [highlightedIndex, setHighlightedIndex] = useState(-1);

	// Refs for input and dropdown elements
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	/**
	 * Load options
	 * Languages and Memberships use predefined lists
	 * Areas of Expertise are fetched from database as users might enter their owe area which we have to make available ot other users
	 */
	useEffect(() => {
		// Use predefined lists for languages and memberships
		if (field === "languages") {
			setAvailableOptions([...LANGUAGES]);
			return;
		}

		if (field === "memberships") {
			setAvailableOptions([...MEMBERSHIPS]);
			return;
		}

		// For other fields, fetch from database
		const fetchOptions = async () => {
			const { data, error } = await supabase
				.from("women")
				.select(field)
				.eq("status", "APPROVED")
				.not(field, "is", null);

			if (error) {
				console.error(`[SearchableSelect] Error fetching ${field}:`, error);
				return;
			}

			const allAreas = new Set<string>();
			data.forEach((item: Record<string, string[]>) => {
				const areas: string[] = item[field];
				if (areas) {
					// Access the array of the areas
					areas.forEach((area) => {
						allAreas.add(area);
					});
				}
			});
			setAvailableOptions(Array.from(allAreas).sort());
		};

		fetchOptions();
	}, [field]);

	/**
	 * Filter options based on search term
	 * Excludes already selected items from filtered results
	 */
	useEffect(() => {
		if (searchTerm) {
			const filtered = availableOptions.filter(
				(option) =>
					option.toLowerCase().includes(searchTerm.toLowerCase()) &&
					!selectedItems.includes(option)
			);
			setFilteredOptions(filtered);
			setHighlightedIndex(-1);
		} else {
			setFilteredOptions(
				availableOptions.filter((option) => !selectedItems.includes(option))
			);
			setHighlightedIndex(-1);
		}
	}, [searchTerm, availableOptions, selectedItems]);

	/**
	 * Add item to selected items
	 * Trims whitespace and prevents duplicates
	 */
	const addItem = (item: string) => {
		if (item.trim() && !selectedItems.includes(item.trim())) {
			onItemsChange([...selectedItems, item.trim()]);
			setSearchTerm("");
			setIsOpen(false);
			setHighlightedIndex(-1);
		}
	};

	/**
	 * Remove item from selected items
	 */
	const removeItem = (item: string) => {
		onItemsChange(selectedItems.filter((i) => i !== item));
	};

	/**
	 * Handle input change
	 * Opens dropdown when user starts typing
	 */
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setIsOpen(true);
	};

	/**
	 * Handle keyboard navigation
	 * - Enter: Add highlighted item or current search term
	 * - ArrowDown/ArrowUp: Navigate through options
	 * - Escape: Close dropdown
	 */
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
				addItem(filteredOptions[highlightedIndex]);
			} else if (searchTerm.trim()) {
				// Only allow custom values for fields that don't have predefined lists
				// Languages and memberships must be selected from the predefined list
				if (field !== "languages" && field !== "memberships") {
					addItem(searchTerm);
				}
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
		} else if (e.key === "Escape") {
			setIsOpen(false);
			setHighlightedIndex(-1);
		}
	};

	/**
	 * Handle clicking on an option
	 */
	const handleOptionClick = (option: string) => {
		addItem(option);
	};

	/**
	 * Close dropdown when clicking outside
	 */
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setHighlightedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<Label>{label}</Label>
			<div className="relative">
				<div className="flex items-center">
					{/* Search input */}
					<Input
						ref={inputRef}
						value={searchTerm}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsOpen(true)}
						placeholder={placeholder}
						className="pr-10"
					/>
					{/* Dropdown toggle button */}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-1 h-8 w-8 p-0"
						onClick={() => {
							setIsOpen(!isOpen);
							inputRef.current?.focus();
						}}
					>
						<ChevronDown
							className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
						/>
					</Button>
				</div>

				{/* Dropdown menu with filtered options */}
				{isOpen && (filteredOptions.length > 0 || searchTerm) && (
					<div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
						{filteredOptions.length > 0 ? (
							<ul className="py-1">
								{filteredOptions.map((option, index) => (
									<li
										key={option}
										className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
											index === highlightedIndex ? "bg-accent" : ""
										}`}
										onClick={() => handleOptionClick(option)}
									>
										{option}
									</li>
								))}
							</ul>
						) : (
							searchTerm && (
								/* Show message when no matches found */
								<div className="px-3 py-2 text-sm text-muted-foreground">
									{field === "languages" || field === "memberships"
										? `No matches found. Please select from the list above.`
										: `Press Enter to add "${searchTerm}"`}
								</div>
							)
						)}
					</div>
				)}
			</div>

			{/* Selected items displayed as badges */}
			<div className="flex flex-wrap gap-1 mt-2">
				{selectedItems.map((item) => (
					<Badge
						key={item}
						variant={variant}
						className="cursor-pointer flex items-center gap-1"
					>
						{/* Language flag for language selections */}
						{field === "languages" && (
							<span className="text-sm">{getLanguageFlag(item)}</span>
						)}
						{item}
						{/* Remove button */}
						<X className="w-3 h-3 ml-1" onClick={() => removeItem(item)} />
					</Badge>
				))}
			</div>
		</div>
	);
}
