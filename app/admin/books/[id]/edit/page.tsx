import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/admin/actions/book";
import BookForm from "@/components/admin/forms/BookForm";

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const { success, data: book } = await getBook({ id });

  if (!success) redirect("/404");

  return (
    <>
      <Button asChild className="back-btn">
        <Link href="/admin/books">Go Back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <BookForm type="update" {...book} />
      </section>
    </>
  );
};

export default Page;
