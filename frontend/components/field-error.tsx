export default function FieldError({ error }: { error: string | null }) {
  return <p className="text-red-700 text-[12px]">{error}</p>;
}
