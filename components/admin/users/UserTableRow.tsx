"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import Menu from "@/components/admin/Menu";
import { useToast } from "@/hooks/use-toast";
import config from "@/lib/config";
import { userRoles } from "@/constants";
import { updateUserRole, deleteUserAction } from "@/lib/admin/actions/user";
import type { users } from "@/database/schema";
import { InferSelectModel } from "drizzle-orm";
// Removed AlertDialog imports
import { Button } from "@/components/ui/button";

type User = InferSelectModel<typeof users>;
type Role = User["role"];

interface UserTableRowProps {
  user: User;
  totalBorrowedBooks: number;
}

const UserTableRow = ({ user, totalBorrowedBooks }: UserTableRowProps) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentRole, setCurrentRole] = useState<Role>(user.role ?? "USER");

  const handleRoleChange = (newRoleValue: string) => {
    const newRole = newRoleValue.toUpperCase() as Role;
    if (newRole === currentRole) return;

    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole);
      if (result.success && result.data) {
        setCurrentRole(result.data.role ?? "USER");
        toast({
          title: "Success",
          description: `User role updated to ${
            userRoles.find((r) => r.value.toUpperCase() === newRole)?.label ||
            newRole
          }.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update user role.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteClick = () => {
    startTransition(async () => {
      console.log(`Attempting to delete user: ${user.id}`);
      try {
        const result = await deleteUserAction(user.id);
        console.log("Delete action result:", result);

        if (result.success) {
          toast({
            title: "Success",
            description: `User ${user.fullname} deleted successfully.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Error Deleting User",
            description: result.error || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Client-side error calling deleteUserAction:", error);
        toast({
          title: "Client Error",
          description: "An error occurred before sending the delete request.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <TableRow key={user.id} className="border-b-dark-100/5 text-sm font-medium">
      <TableCell className="text-dark-200">{user.fullname}</TableCell>
      <TableCell className="text-dark-200">
        {dayjs(user.createdAt).format("MMM DD, YYYY")}
      </TableCell>
      <TableCell>
        <Menu
          label="Change Role"
          initialValue={(currentRole ?? "USER").toLowerCase()}
          items={userRoles}
          onValueChange={handleRoleChange}
        />
      </TableCell>
      <TableCell className="text-dark-200">{user.universityId}</TableCell>
      <TableCell className="text-blue-100">
        <div className="flex items-center gap-1.5">
          <Link
            href={`${config.env.imagekit.urlEndpoint}${user.universityCard}`}
            target="_blank"
          >
            View ID Card
          </Link>
          <Image
            src="/icons/admin/link.svg"
            width={14}
            height={14}
            className="object-contain"
            alt="link icon"
          />
        </div>
      </TableCell>
      <TableCell className="w-24 text-dark-200">{totalBorrowedBooks}</TableCell>
      <TableCell className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={handleDeleteClick}
          aria-label={`Delete user ${user.fullname}`}
        >
          <Image
            src="/icons/admin/trash.svg"
            width={20}
            height={20}
            className="cursor-pointer object-contain opacity-50 hover:opacity-100"
            alt=""
          />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
