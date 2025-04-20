import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Removed unused imports: dayjs, Link, Image, Menu, userRoles, config

import Pagination from "@/components/Pagination";
import { getUsers } from "@/lib/admin/actions/user";
import UserTableRow from "@/components/admin/users/UserTableRow"; // Import the new component

const Page = async ({ searchParams }: PageProps) => {
  const { query, sort, page } = await searchParams;

  const { data: allRecords, metadata } = await getUsers({
    query,
    sort,
    page,
  });

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <h2 className="text-xl font-semibold">All Users</h2>

      <div className="mt-7 w-full overflow-hidden">
        <Table className="overflow-hidden">
          <TableHeader>
            <TableRow className="h-14 border-none bg-light-300">
              <TableHead className="w-72">Name</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>University ID No</TableHead>
              <TableHead>University ID Card</TableHead>
              <TableHead>Books Borrowed</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allRecords?.length > 0 ? (
              allRecords!.map(({ user, totalBorrowedBooks }) => (
                // Use the new UserTableRow component
                <UserTableRow
                  key={user.id}
                  user={user}
                  totalBorrowedBooks={totalBorrowedBooks}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="pt-10 text-center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8">
        <Pagination variant="light" hasNextPage={metadata?.hasNextPage} />
      </div>
    </section>
  );
};

export default Page;
