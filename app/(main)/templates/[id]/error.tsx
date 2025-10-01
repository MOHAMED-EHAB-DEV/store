"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="pt-36 sm:pt-46 md:pt-36 text-center text-red-500">
      <p>Something went wrong: {error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}
