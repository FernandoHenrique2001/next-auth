"use client";

import { useSession } from "next-auth/react";
import LoginForm from "./_components/login-form";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const navigate = useRouter();
  const session = useSession();

  if (session.status === "authenticated") {
    navigate.push("/dashboard");
  }

  return <LoginForm />;
}
