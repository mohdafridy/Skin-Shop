import { announcementMessage } from "@/data/navigation";

export default function AnnouncementBar() {
  return (
    <div className="flex h-8 items-center justify-center bg-wine px-4 sm:h-9">
      <p className="text-center font-display text-sm tracking-wide text-ivory sm:text-base">
        {announcementMessage}
      </p>
    </div>
  );
}
