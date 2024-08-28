export default function EmptySlot(
  props: React.HTMLProps<HTMLParagraphElement>,
) {
  return (
    <p
      {...props}
      className="flex h-36 w-24 select-none items-center justify-center rounded-lg border-2 border-dotted border-green-500 bg-green-200 pb-12 pt-4 shadow-md"
    ></p>
  );
}
