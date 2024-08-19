import { cn } from "@/utils";
import { ChangeEventHandler } from "react";

export default function RntFileButton({
  className,
  id,
  children,
  onChange: onFileChange,
  disabled,
  accept,
  ...props
}: {
  className?: string;
  id?: string;
  children?: React.ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  accept?: string;
}) {
  const bgColor = disabled ? "bg-gray-500" : "buttonGradient";
  const baseClassName =
    "h-12 w-56 rounded-full text-white text-lg flex justify-center items-center cursor-pointer " + bgColor;
  const c = cn(baseClassName, className);
  return (
    <label {...props} className={c}>
      <input
        disabled={disabled}
        className="hidden"
        type="file"
        id={id}
        name={id}
        onChange={onFileChange}
        accept={accept}
      />
      {children}
    </label>
  );
}
