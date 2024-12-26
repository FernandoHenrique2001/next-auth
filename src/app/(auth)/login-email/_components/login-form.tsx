"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import emailLogin from "../_actions/email-login";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  return (
    <Card className="mx-auto max-w-96">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Receba um link de acesso no seu email</CardDescription>
      </CardHeader>
      <CardContent>
        {" "}
        <form action={emailLogin} className="text-left ">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" id="email" placeholder="Email" />
          </div>
          <Button size={"lg"} type="submit" className="w-full mt-10 flex gap-3">
            <Mail className="w-4 h-4" />
            Login com Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
