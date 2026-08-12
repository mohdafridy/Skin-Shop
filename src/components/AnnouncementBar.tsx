import { announcementMessage } from "@/data/navigation";

export default function AnnouncementBar() {
  return (
    <div className="flex h-7 items-center justify-center bg-wine px-4 sm:h-8">
      <p className="text-center font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ivory/90 sm:text-[11px]">
        {announcementMessage}
      </p>
    </div>
  );
}
