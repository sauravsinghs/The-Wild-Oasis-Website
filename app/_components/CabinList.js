import { unstable_noStore as noStore } from "next/cache";

import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "../_lib/data-service";

async function CabinList({ filter }) {
  // noStore();
  let cabins = [];
  let loadError = null;
  try {
    cabins = await getCabins();
  } catch (err) {
    loadError = err;
    console.error("Cabin list load error:", err);
  }

  if (loadError) {
    return (
      <div className="border border-primary-800 bg-primary-900 p-6 text-lg text-primary-200">
        We couldn&apos;t load cabins right now. Please check your Supabase
        connection and try again.
      </div>
    );
  }

  if (!cabins.length) return null;

  let displayedCabins;
  if (filter === "all") displayedCabins = cabins;
  if (filter === "small")
    displayedCabins = cabins.filter((cabin) => cabin.maxCapacity <= 3);
  if (filter === "medium")
    displayedCabins = cabins.filter(
      (cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7
    );
  if (filter === "large")
    displayedCabins = cabins.filter((cabin) => cabin.maxCapacity >= 8);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
      {displayedCabins.map((cabin) => (
        <CabinCard cabin={cabin} key={cabin.id} />
      ))}
    </div>
  );
}

export default CabinList;
