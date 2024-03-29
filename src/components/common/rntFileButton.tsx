import { twMerge } from "tailwind-merge";
import { ChangeEventHandler } from "react";

type Props = {
  className?: string;
  id?: string;
  children?: React.ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
};

export default function RntFileButton({ className, id, children, onChange: onFileChange, disabled, ...props }: Props) {
  const bgColor = disabled ? "bg-gray-500" : "bg-violet-700";
  const baseClassName =
    "h-12 w-56 rounded-full text-white text-lg flex justify-center items-center cursor-pointer " + bgColor;
  const c = twMerge(baseClassName, className);
  return (
    <label {...props} className={c}>
      <input disabled={disabled} className="hidden" type="file" id={id} name={id} onChange={onFileChange} />
      {children}
    </label>
  );
}
