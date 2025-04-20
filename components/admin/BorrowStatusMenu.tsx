// Create file: c:\\Users\\youss\\Desktop\\university-library\\components\\admin\\BorrowStatusMenu.tsx

"use client";

import { useState, useTransition } from "react";
import Menu from "./Menu"; // The modified Menu component
import { borrowStatuses } from "@/constants"; // Assuming borrowStatuses is correctly typed
import { updateBorrowStatus } from "@/lib/admin/actions/book"; // The server action
import { useToast } from "@/hooks/use-toast"; // For showing feedback

// Define the expected status type based on your constants/schema
type BorrowStatusValue = (typeof borrowStatuses)[number]["value"];

interface Props {
  borrowId: string;
  initialStatus: BorrowStatusValue;
}

const BorrowStatusMenu = ({ borrowId, initialStatus }: Props) => {
  const [currentStatus, setCurrentStatus] =
    useState<BorrowStatusValue>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (newValue: string) => {
    // Ensure the newValue is a valid status before proceeding
    const validStatus = newValue as BorrowStatusValue;
    if (!borrowStatuses.some((status) => status.value === validStatus)) {
      console.error("Invalid status selected:", validStatus);
      return;
    }

    // Optimistically update the UI
    setCurrentStatus(validStatus);

    // Call the server action within a transition
    startTransition(async () => {
      try {
        // Convert to uppercase if your DB schema expects it (e.g., BORROWED, RETURNED)
        const result = await updateBorrowStatus(
          borrowId,
          validStatus.toUpperCase() as any
        ); // Adjust case if needed

        if (!result.success) {
          // Revert optimistic update on error
          setCurrentStatus(initialStatus);
          toast({
            title: "Error",
            description: result.error || "Failed to update status.",
            variant: "destructive",
          });
        } else {
          // Optional: Show success toast
          toast({
            title: "Success",
            description: "Status updated successfully.",
          });
          // No need to setCurrentStatus again if revalidation works correctly
        }
      } catch (error) {
        // Revert optimistic update on unexpected error
        setCurrentStatus(initialStatus);
        console.error("Failed to update status:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Menu
      label="Change Status"
      initialValue={currentStatus} // Use state for the displayed value
      items={borrowStatuses}
      onValueChange={handleStatusChange} // Pass the handler
    />
  );
};

export default BorrowStatusMenu;
