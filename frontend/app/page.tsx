import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/nextauth.config";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }

  return null;
}
