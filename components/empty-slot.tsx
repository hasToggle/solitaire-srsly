export default function EmptySlot(
  props: React.HTMLProps<HTMLParagraphElement>,
) {
  return (
    <p
      {...props}
      className="flex h-56 w-36 select-none items-center justify-center rounded-lg border-2 border-dotted border-sky-500 bg-sky-200 pb-12 pt-4 shadow-md"
    ></p>
  );
}
