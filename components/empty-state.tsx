import { Ban, PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export const EmptyState = ({ title, buttonText, description, href }: Props) => {
  return (
    <div className="flex flex-col flex-1 h-full items-center justify-center rounded-md border-dashed border p-8 text-center animate-in fade-in-50">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <Ban className="size-10 text-primary" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
      <p className="mb-8 mt-2 text-center text-sm leading-tight text-muted-foreground">
        {description}
      </p>

      <Link href={href} className={buttonVariants()}>
        <PlusCircleIcon className="size-4 mr-1" />
        <span className="font-medium">{buttonText}</span>
      </Link>
    </div>
  );
};
