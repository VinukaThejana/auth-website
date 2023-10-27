import { FieldError } from "react-hook-form";

export function FormError(props: {
  err: FieldError | undefined
}) {
  const { err } = props;
  return err ? err.message ? <p className="text-red-400 text-sm font-semibold">* {err.message}</p> : null : null
}

