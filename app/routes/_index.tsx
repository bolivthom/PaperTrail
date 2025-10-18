import type { MetaFunction } from "@remix-run/node";
import LoginPage from "~/components/login-view";

export const meta: MetaFunction = () => {
  return [
    { title: "PaperTrail" },
    { name: "description", content: "Welcome to PaperTrail!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoginPage/>
    </div>
  );
}
