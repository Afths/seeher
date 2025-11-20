/**
 * COUNTRY SELECT COMPONENT
 *
 * A searchable select component for selecting nationality/country.
 * Uses world-countries library for standardized country data.
 *
 * Features:
 * - Pre-populated list of all countries (standardized names)
 * - Search/filter functionality
 * - Keyboard navigation
 * - Prevents inconsistencies (e.g., "Cyprus" vs "Cypriot")
 *
 * Uses ISO 3166-1 alpha-2 country codes for consistency.
 */

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import countries from "world-countries";

interface NationalitySelectProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
}

export function NationalitySelect({ value, onChange, error }: NationalitySelectProps) {
	// Default to Cyprus if no value provided
	const [searchTerm, setSearchTerm] = useState<string>(value || "Cyprus");
	const [isOpen, setIsOpen] = useState<boolean>(false); // Dropdown open/close state
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); // Keyboard navigation - highlighted option index

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const hasSetDefault = useRef<boolean>(false);

	// Prepare country list: common name and ISO code
	const countryList: Array<{ name: string; code: string }> = countries
		.map((country) => ({
			name: country.name.common,
			code: country.cca2,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	// Filter countries based on search term
	const filteredCountries: Array<{ name: string; code: string }> = countryList.filter((country) =>
		country.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	/**
	 * Set default value to Cyprus on mount if no value provided
	 */
	useEffect(() => {
		if (!value && !hasSetDefault.current) {
			hasSetDefault.current = true;
			setSearchTerm("Cyprus");
			onChange("Cyprus");
		}
	}, []);

	/**
	 * Update search term when value prop changes externally
	 *
	 * This handles cases where the value is set outside of this component:
	 * - Pre-population when editing a profile (fetchProfile sets formData)
	 * - Form reset (resetForm clears formData)
	 */
	useEffect(() => {
		if (value) {
			setSearchTerm(value);
		}
	}, [value]);

	// Close dropdown when clicking outside
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

	/**
	 * Handle input field changes
	 * Updates search term as user types and opens dropdown
	 */
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue: string = e.target.value;
		setSearchTerm(newValue);
		setIsOpen(true);
		setHighlightedIndex(-1);
	};

	/**
	 * Handle selecting a country from the dropdown:
	 * - Updates the search term to show the country name
	 * - Calls onChange callback with the country name
	 * - Closes dropdown and resets keyboard navigation
	 */
	const handleSelect = (country: { name: string; code: string }) => {
		setSearchTerm(country.name);
		onChange(country.name);
		setIsOpen(false);
		setHighlightedIndex(-1);
	};

	/**
	 * Handle keyboard navigation and selection
	 * - Enter: Select highlighted option (if any)
	 * - ArrowDown: Move highlight down (wraps to top)
	 * - ArrowUp: Move highlight up (wraps to bottom)
	 * - Escape: Close dropdown and reset highlight
	 */
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
				handleSelect(filteredCountries[highlightedIndex]);
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
		} else if (e.key === "Escape") {
			setIsOpen(false);
			setHighlightedIndex(-1);
		}
	};

	/**
	 * Handle input focus
	 * Opens dropdown when user clicks on the input field
	 */
	const handleFocus = () => {
		setIsOpen(true);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<Label htmlFor="country-select">Nationality *</Label>
			<div className="relative">
				<Input
					ref={inputRef}
					id="country-select"
					value={searchTerm}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					placeholder="Search or select country..."
					required
					className={`pr-10 ${error ? "border-destructive" : ""}`}
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
					onClick={() => {
						setIsOpen(!isOpen);
						inputRef.current?.focus();
					}}
				>
					<ChevronDown
						className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
					/>
				</Button>

				{/* Dropdown menu */}
				{isOpen && filteredCountries.length > 0 && (
					<div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
						<ul className="py-1">
							{filteredCountries.map((country, index) => (
								<li
									key={country.code}
									className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
										index === highlightedIndex ? "bg-accent" : ""
									}`}
									onClick={() => handleSelect(country)}
									onMouseEnter={() => setHighlightedIndex(index)}
								>
									{country.name}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
			{error && <p className="text-sm text-destructive mt-1">{error}</p>}
		</div>
	);
}
