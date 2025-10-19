import type { MetaFunction } from "@remix-run/node";
import ReceiptsTable from "~/components/receiptsTable";

export const meta: MetaFunction = () => {
  return [
    { title: "PaperTrail" },
    { name: "description", content: "Welcome to PaperTrail!" },
  ];
};

export default function AllReceipts() {
  return (
    <div className="flex h-screen">
      <ReceiptsTable/>
    </div>
  );
}
