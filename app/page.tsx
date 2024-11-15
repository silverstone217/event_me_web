import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col w-full gap-10">
      <h1 className="text-3xl text-center text-foreground">
        Welcome to EventMe!
      </h1>
      <div className="flex flex-col gap-5 ">
        <Link
          href="/events"
          className="flex items-center justify-center px-5 py-3 
           text-foreground font-medium text-xl"
        >
          View Events
        </Link>
        <Link
          href="/create-event"
          className="flex items-center justify-center px-5 py-3 
          text-foreground font-medium text-xl"
        >
          Create Event
        </Link>
      </div>
    </div>
  );
}
