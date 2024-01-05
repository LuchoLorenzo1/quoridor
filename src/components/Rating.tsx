import { twMerge } from "tailwind-merge";

const Rating = ({
  rating,
  className,
}: {
  rating?: { rating: number; rd: number };
  className?: string;
}) => {
  if (!rating) return "";

  if (rating.rd >= 0) {
    return (
      <span
        className={twMerge("relative font-normal text-sm group", className)}
      >
        <div className="z-30 p-1 w-40 text-xs hidden absolute top-0 left-full bg-stone-800 text-stone-200 group-hover:inline-block">
          <h1 className="">
            Not enough rated games have been played to establish a reliable
            rating. Rating Deviation: {rating.rd.toPrecision(5)}
          </h1>
        </div>
        (
        <span className="underline decoration-black decoration-dashed">
          {rating.rating}?
        </span>
        )
      </span>
    );
  }

  return (
    <span className={twMerge("relative font-normal text-sm group", className)}>
      <div className="z-30 p-2 text-xs hidden absolute left-full ml-1 transform bg-stone-800 text-stone-200 group-hover:inline-block">
        <h1 className="whitespace-nowrap">
          Rating Deviation: {rating.rd.toPrecision(5)}
        </h1>
      </div>
      ({rating.rating})
    </span>
  );
};

export default Rating;
