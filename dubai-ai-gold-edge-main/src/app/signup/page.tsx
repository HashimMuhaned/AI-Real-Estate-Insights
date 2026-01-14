"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dubaiAuthImage from "@/assets/dubai-auth-hero.jpg";

const SignUp = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/login");
      } else {
        console.error("Signup failed", data.error);
      }
    } catch (err) {
      console.error("Error during signup:", err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 lg:w-[50%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-3xl font-serif font-bold text-foreground">
              Join Dubai Real Estate
            </h1>
            <p className="text-muted-foreground">
              Start your investment journey with Dubai's premier real estate
              platform
            </p>
          </div>

          <Card className="luxury-card border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-serif">
                Create Account
              </CardTitle>
              <CardDescription>
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 cta-primary text-lg font-medium"
                >
                  Create Account
                </Button>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <div className="flex-grow h-px bg-muted"></div>
                  <span className="px-2 text-sm text-muted-foreground">or</span>
                  <div className="flex-grow h-px bg-muted"></div>
                </div>

                {/* Sign up with Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-lg font-medium flex items-center justify-center gap-2"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                  <Image
                    src="/google-icon.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  Sign up with Google
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-[50%] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <Image
          src={dubaiAuthImage}
          alt="Dubai Real Estate - Luxury Properties and Investment"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-serif font-bold mb-4">
            Invest in Dubai's Future
          </h2>
          <p className="text-lg text-white/90 max-w-md">
            Join thousands of investors who trust our platform for Dubai real
            estate insights and opportunities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
