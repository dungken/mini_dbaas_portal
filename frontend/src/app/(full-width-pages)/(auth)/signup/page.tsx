import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | CloudDB Manager",
  description: "Sign up for CloudDB Manager",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
