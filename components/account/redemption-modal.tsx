"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, AlertTriangle } from "lucide-react";

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (courseType: string, pointsRequired: number) => void;
  courseType: string;
  pointsRequired: number;
  currentBalance: number;
}

export function RedemptionModal({
  isOpen,
  onClose,
  onConfirm,
  courseType,
  pointsRequired,
  currentBalance,
}: RedemptionModalProps) {
  const canAfford = currentBalance >= pointsRequired;
  const courseTypeLabel =
    courseType.charAt(0).toUpperCase() + courseType.slice(1).replace("_", " ");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Redeem Mind Points
          </DialogTitle>
          <DialogDescription>
            Confirm your redemption to receive a 100% discount coupon code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Redemption Details
            </div>
            <div className="font-semibold text-lg">{courseTypeLabel}</div>
            <div className="text-sm text-muted-foreground">
              Cost: {pointsRequired} Mind Points
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">
              Your Balance
            </div>
            <div className="font-semibold text-lg">
              {currentBalance.toLocaleString()} points
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              After redemption:{" "}
              <span className="font-medium">
                {(currentBalance - pointsRequired).toLocaleString()} points
              </span>
            </div>
          </div>

          {!canAfford && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have enough points. You need {pointsRequired} points
                but only have {currentBalance}.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              After redemption, you'll receive a unique coupon code via email
              that can be used during checkout for a 100% discount on any course
              of this type.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(courseType, pointsRequired);
            }}
            disabled={!canAfford}
          >
            Confirm Redemption
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

