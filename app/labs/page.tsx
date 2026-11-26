import type { Metadata } from "next";
import Site from "../site";

export const metadata: Metadata = {
  title: "AI Labs · 1655 Studio",
  description: "Tools built at 1655 Studio: Shadra, Strands and Reelsmith.",
};

export default function LabsPage() {
  return <Site page="labs" />;
}
