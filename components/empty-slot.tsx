export default function EmptySlot(
  props: React.HTMLProps<HTMLParagraphElement>,
) {
  return (
    <p
      {...props}
      className="flex h-20 w-12 select-none items-center justify-center overflow-hidden rounded-lg border-4 border-dotted border-sky-500 bg-sky-200 pb-6 pt-4 shadow-md sm:h-24 sm:w-16 md:h-32 md:w-20 lg:h-40 lg:w-24 xl:h-56 xl:w-36"
    ></p>
  );
}
