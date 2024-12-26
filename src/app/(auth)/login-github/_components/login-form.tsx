"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiGithub } from "@icons-pack/react-simple-icons";
import githubLogin from "../_actions/github-login";

export default function LoginForm() {
  return (
    <Card className="mx-auto max-w-96">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Entre com seu Github</CardDescription>
      </CardHeader>
      <CardContent>
        {" "}
        <form action={githubLogin} className="text-left ">
          <Button size={"lg"} type="submit" className="w-full mt-10 flex gap-3">
            <SiGithub />
            Login com Github
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
