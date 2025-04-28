import Link from "next/link";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BookCover from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { deleteBookAction, getBooks } from "@/lib/admin/actions/book";

const Page = async ({ searchParams }: PageProps) => {
  const { query, sort, page } = await searchParams;

  const { data: allBooks, metadata } = await getBooks({
    query,
    sort,
    page,
  });

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Books</h2>
        <Button className="bg-primary-admin" asChild>
          <Link href="/admin/books/new">+ Create a New Book</Link>
        </Button>
      </div>

      <div className="mt-7 w-full overflow-hidden">
        <Table className="overflow-hidden">
          <TableHeader>
            <TableRow className="h-14 border-none bg-light-300">
              <TableHead className="w-[500px]">Book Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>View</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allBooks?.length > 0 ? (
              allBooks?.map((book) => (
                <TableRow key={book.id} className="border-b-dark-100/5">
                  <TableCell className="py-5 font-medium">
                    <div className="flex w-96 flex-row items-center gap-2 text-sm font-semibold text-dark-400">
                      <BookCover
                        variant="extraSmall"
                        coverUrl={book.coverUrl}
                        coverColor={book.coverColor}
                      />
                      <p className="flex-1">{book.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-dark-200">
                    {book.author}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-dark-200">
                    {book.genre}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-dark-200">
                    Dec 19 2023
                  </TableCell>
                  <TableCell>
                    <Button asChild className="view-btn !shadow">
                      <Link href={`/admin/books/${book.id}`}>View</Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center gap-3.5">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="relative size-5"
                      >
                        <Image
                          src="/icons/admin/edit.svg"
                          fill
                          className="object-contain"
                          alt="edit"
                        />
                      </Link>

                      <form
                        action={async () => {
                          "use server";
                          await deleteBookAction(book.id);
                        }}
                      >
                        <button type="submit" className="group cursor-pointer">
                          <Image
                            src="/icons/admin/trash.svg"
                            width={20}
                            height={20}
                            className="object-contain opacity-50 transition-opacity group-hover:opacity-100"
                            alt="delete"
                          />
                        </button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="pt-10 text-center">
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
