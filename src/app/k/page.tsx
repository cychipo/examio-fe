import { redirect } from "next/navigation";

export default function Page() {
  redirect("/k/ai-tool");
  return <div className="flex flex-1 flex-col p-4"></div>;
}
