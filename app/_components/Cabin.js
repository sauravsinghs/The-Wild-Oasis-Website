import { EyeSlashIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import TextExpander from "./TextExpander";

const FALLBACK_CABIN_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'%3E%3Crect width='100%25' height='100%25' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' fill='%23e2e8f0' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36'%3ECabin image unavailable%3C/text%3E%3C/svg%3E";

function Cabin({ cabin }) {
  const { id, name, maxCapacity, regularPrice, discount, image, description } =
    cabin;

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
        <Image
          src={image || FALLBACK_CABIN_IMAGE}
          fill
          unoptimized
          className="object-cover hover:scale-105 transition-transform duration-300"
          alt={`Cabin ${name}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-accent-400 mb-4">
            Cabin {name}
          </h1>
          <p className="text-lg text-primary-200">
            <TextExpander>{description}</TextExpander>
          </p>
        </div>

        <ul className="space-y-4">
          <li className="flex items-center gap-3 text-lg">
            <UsersIcon className="h-6 w-6 text-accent-500" />
            <span>
              Fits up to{" "}
              <span className="font-semibold text-accent-400">
                {maxCapacity}
              </span>{" "}
              guests
            </span>
          </li>
          <li className="flex items-center gap-3 text-lg">
            <MapPinIcon className="h-6 w-6 text-accent-500" />
            <span>
              Located in the heart of the{" "}
              <span className="font-semibold text-accent-400">Dolomites</span>{" "}
              (Italy)
            </span>
          </li>
          <li className="flex items-center gap-3 text-lg">
            <EyeSlashIcon className="h-6 w-6 text-accent-500" />
            <span>
              Privacy{" "}
              <span className="font-semibold text-accent-400">100%</span>{" "}
              guaranteed
            </span>
          </li>
        </ul>

        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-semibold text-accent-400">
            ${regularPrice - discount}
            {discount > 0 && (
              <span className="text-xl line-through text-primary-400 ml-2">
                ${regularPrice}
              </span>
            )}
          </p>
          <span className="text-lg text-primary-300">per night</span>
        </div>
      </div>
    </div>
  );
}

export default Cabin;
