import { dateFormat } from "@/utils/datetimeFormatters";

type Props = {
  title: string;
  datetime: Date;
  message: string;
};

export default function Notification({ title, datetime, message }: Props) {
  return (
    <div className="bg-rentality-bg rnt-card w-full flex flex-col gap-2 rounded-xl overflow-hidden p-4">
      <div className="flex flex-row justify-between">
        <div className="font-bold text-lg text-rentality-secondary">{title}</div>
        <div className="text-sm text-gray-200">{dateFormat(datetime)}</div>
      </div>
      <div className="text-gray-200">{message}</div>
    </div>
  );
}
