import { announcementMessage } from "@/data/navigation";

export default function AnnouncementBar() {
  return (
    <div className="bg-burgundy px-4 py-2.5 text-center">
      <p className="font-display text-sm tracking-wide text-ivory sm:text-base">
        {announcementMessage}
      </p>
    </div>
  );
}
