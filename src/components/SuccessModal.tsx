/**
 * SUCCESS MODAL COMPONENT
 *
 * Displays a success message after profile submission.
 * Shows confirmation that the profile has been received and is under review.
 *
 * Features:
 * - Green checkmark icon
 * - Thank you message
 * - Information about review timeline (1-2 weeks)
 * - Close button
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          {/* Success icon */}
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            Thank you for being here!
          </DialogTitle>
        </DialogHeader>
        
        {/* Success message */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your profile is being reviewed. We get in touch as soon as we get to it - typically 1-2 weeks. 🤍
          </p>
          
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
