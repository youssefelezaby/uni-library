import Link from "next/link";

import BookStripe from "../BookStripe";
import { Button } from "@/components/ui/button";

import { getBorrowRecords } from "@/lib/admin/actions/book";

const BorrowRequests = async () => {
  const { data: borrowRecords } = await getBorrowRecords({
    sort: "newest",
    page: 1,
    limit: 5,
  });

  if (!borrowRecords) {
    throw new Error("Failed to fetch borrow records");
  }

  return (
    <section className="rounded-xl bg-white p-4">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold  text-dark-400">
          Borrow Requests
        </h3>

        <Button asChild className="view-btn">
          <Link href="/admin/borrow-records">View All</Link>
        </Button>
      </div>

      <div className="mt-7 space-y-3">
        {borrowRecords?.length! > 0 &&
          borrowRecords?.map((book) => (
            <BookStripe key={book.borrow.id} book={book as BorrowedBook} />
          ))}
      </div>
    </section>
  );
};

export default BorrowRequests;
