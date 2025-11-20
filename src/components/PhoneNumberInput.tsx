/**
 * PHONE NUMBER INPUT COMPONENT
 *
 * A simple phone number input component.
 * Users can enter their phone number directly in any format.
 *
 * Returns phone number as entered by the user (validated on backend if needed)
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneNumberInputProps {
	id: string;
	value: string;
	onChange: (value: string | undefined) => void;
	error?: string;
}

export function PhoneNumberInput({ id, value, onChange, error }: PhoneNumberInputProps) {
	/**
	 * Handle input change - enforce format: +[digits] (e.g., +35799123456)
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let v = e.target.value;

		// Keep only digits and "+"
		v = v.replace(/[^\d+]/g, "");

		// Always enforce a single "+" at the start
		if (!v.startsWith("+")) {
			v = "+" + v.replace(/\+/g, "");
		} else {
			// If it starts with "+", remove *any* extra "+" later
			v = "+" + v.slice(1).replace(/\+/g, "");
		}

		onChange(v);
	};

	return (
		<div>
			<Label htmlFor={id}>Contact Number</Label>
			<Input
				id={id}
				type="tel"
				value={value || ""}
				onChange={handleChange}
				placeholder="Enter your phone number (including country code)"
				className={cn(error && "border-destructive")}
			/>
			{error && <p className="text-sm text-destructive mt-1">{error}</p>}
		</div>
	);
}
