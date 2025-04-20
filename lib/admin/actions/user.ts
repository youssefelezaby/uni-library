"use server";

import { revalidatePath } from "next/cache";
import { or, desc, asc, count, eq, ilike } from "drizzle-orm";

import { db } from "@/database/drizzle";
import { borrowRecords, users } from "@/database/schema";

const ITEMS_PER_PAGE = 20;

export async function getUsers({
  query,
  sort = "available",
  page = 1,
  limit = ITEMS_PER_PAGE,
}: QueryParams) {
  try {
    const searchConditions = query
      ? or(
          ilike(users.fullname, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
      : undefined;

    const sortOptions: Record<string, any> = {
      newest: desc(users.createdAt),
      oldest: asc(users.createdAt),
    };

    const sortingCondition = sortOptions[sort] || desc(users.createdAt);

    const usersData = await db
      .select({
        user: users,
        totalBorrowedBooks: count(borrowRecords.id).as("totalBorrowedBooks"),
      })
      .from(users)
      .leftJoin(
        borrowRecords,
        eq(borrowRecords.userId, users.id) // Match borrow records to users.
      )
      .where(searchConditions)
      .groupBy(users.id) // Group by user to get borrow counts.
      .orderBy(sortingCondition)
      .limit(limit)
      .offset((page - 1) * limit);

    const totalItems = await db
      .select({
        count: count(users.id),
      })
      .from(users)
      .where(searchConditions);

    const totalPages = Math.ceil(totalItems[0].count / ITEMS_PER_PAGE);
    const hasNextPage = page < totalPages;

    return {
      success: true,
      data: usersData,
      metadata: {
        totalPages,
        hasNextPage,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "An error occurred while fetching users",
    };
  }
}

export async function updateAccountStatus(params: UpdateAccountStatusParams) {
  const { userId, status } = params;

  try {
    const updatedUser = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/admin/account-requests");
    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      error: "An error occurred while updating user status",
    };
  }
}

// Action to update user role
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const updatedUser = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return { success: false, error: "User not found." };
    }

    revalidatePath("/admin/users"); // Revalidate the users page

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedUser[0])), // Ensure data is serializable
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role." };
  }
}

// Action to delete a user
export async function deleteUserAction(userId: string) {
  try {
    // Optional: Check if the user exists first
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return { success: false, error: "User not found." };
    }

    // Attempt to delete the user
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin/users"); // Revalidate the users page

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    // Check for specific database errors, e.g., foreign key constraint violation
    if (
      error instanceof Error &&
      error.message.includes("violates foreign key constraint")
    ) {
      return {
        success: false,
        error:
          "Cannot delete user. User may have active borrow records or other dependencies.",
      };
    }
    return { success: false, error: "Failed to delete user." };
  }
}
