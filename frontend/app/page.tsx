import { redirect } from "next/navigation";

// Automatically redirect root path to the login page
export default function Home() {
  redirect("/login");
}