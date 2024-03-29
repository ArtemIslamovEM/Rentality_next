import Link from "next/link";
import RntButton from "../common/rntButton";

export type PageTitleLink = {
  text: string;
  link: string;
};

type Props = {
  title: string;
  actions?: PageTitleLink[];
};

export default function PageTitle({ title, actions }: Props) {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="text-2xl">
        <strong>{title}</strong>
      </div>
      {actions == undefined || actions.length === 0
        ? null
        : actions.map((action) => {
            return (
              <Link key={action.text} href={action.link}>
                <RntButton className="w-56 h-16">{action.text}</RntButton>
              </Link>
            );
          })}
    </div>
  );
}
