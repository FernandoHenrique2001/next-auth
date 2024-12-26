"use server";

import { signIn } from "@/auth";


export default async function emailLogin(formData: FormData) {
    const email = formData.get("email") as string;
    await signIn("nodemailer", { email, redirectTo: "/dashboard" });
}
