"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Code,
  Database,
  Users,
  ArrowDownCircle,
  ArrowRight,
  FileEdit,
  GraduationCap,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-montserrat",
});

export function LandingPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const faqRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    leetcodeUsername: "",
    gfgUsername: "",
  });

  // Forgot Password form state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Number of online users (5 to 12) on component mount
  useEffect(() => {
    const randomUsers = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
    setOnlineUsers(randomUsers);
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      router.push("/problemset");
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      let response: Response | undefined;

      if (activeTab === "login") {
        const formData = new URLSearchParams();
        formData.append("username", loginData.username);
        formData.append("password", loginData.password);
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
      } else if (activeTab === "register") {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: signupData.fullName,
            username: signupData.username,
            email: signupData.email,
            password: signupData.password,
            leetcode_username: signupData.leetcodeUsername || "",
            gfg_username: signupData.gfgUsername || "",
          }),
        });
      } else if (activeTab === "forgot-password") {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: forgotPasswordData.email,
            }),
          }
        );
      }

      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response from server:", errorData);
        throw new Error(errorData.detail || "Request failed");
      }

      const data = await response.json();

      if (activeTab === "forgot-password") {
        setSuccessMessage("A password reset link has been sent to your email.");
        setForgotPasswordData({ email: "" });
        setActiveTab("login");
      } else {
        const token = data.access_token;
        if (!token) {
          throw new Error("No token received from server");
        }
        localStorage.setItem("jwt_token", token);
        console.log(`${activeTab} successful, redirecting to /problemset`);
        router.push("/problemset");
      }
    } catch (err: any) {
      console.error(`${activeTab} error:`, err);
      setError(err.message || "Failed to process request. Please try again.");
      if (activeTab === "login") {
        setLoginData((prev) => ({
          ...prev,
          password: "",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToFAQs = () => {
    faqRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle modal open/close and reset states when closing
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setError("");
      setSuccessMessage("");
      setLoginData({ username: "", password: "" });
      setSignupData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        leetcodeUsername: "",
        gfgUsername: "",
      });
      setForgotPasswordData({ email: "" });
      setActiveTab("login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-opacity-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-950/60 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className=" text-white dark:bg-white dark:text-black h-10 w-10 flex items-center justify-center rounded-lg font-bold text-xl">
              <img
                src="/assets/images/grindsheet-logo-transparent.png"
                alt="GrindSheet Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">GrindSheet</h1>
              <p className="text-xs font-bold text-black-800 dark:text-gray-400">
                Track. Solve. Improve.
              </p>
            </div>
          </div>
          <Button
            className="hover:cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {/* Hero section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
          {/* Abstract shapes */}
          <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-black rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6`}>
              Master{" "}
              <span className="text-[#4a2a6e] dark:text-[#b19cd9]">
                Data Structures
              </span>{" "}
              &{" "}
              <span className="text-[#4a2a6e] dark:text-[#b19cd9]">
                Algorithms
              </span>
            </h1>

            <p
              className={`text-md md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto`}
            >
              Track your progress, organize your practice, and improve your
              coding skills with our comprehensive DSA tracker designed for
              interview success.
            </p>

            <div
              className={`flex flex-col sm:flex-row justify-center gap-4 mt-8 max-w-[60%] sm:max-w-lg md:max-w-2xl mx-auto`}
            >
              <Button
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className={`hover:cursor-pointer bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-md transition-all duration-300 group ${jetBrainsMono.className}`}
              >
                Start Tracking Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={scrollToFAQs}
                className="hover:cursor-pointer border-gray-300 hover:border-gray-400 transition-all duration-300 group"
              >
                Learn More{" "}
                <ArrowDownCircle className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Button>
            </div>

            {/* Code Snippet */}
            <div
              className={`mt-16 max-w-[100%] sm:max-w-lg md:max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-xl overflow-hidden opacity-90 transition-all duration-1000 delay-700 ${jetBrainsMono.className}`}
            >
              <div className="flex items-center px-4 py-2 bg-gray-800">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-4 text-sm text-gray-400">grindsheet.js</div>
              </div>
              <div className="px-4 py-2 sm:p-4 text-left font-mono text-xs sm:text-sm text-green-400">
                <div>
                  <span className="text-blue-400">function</span>{" "}
                  <span className="text-yellow-400">solveProblems</span>
                  () {"{"}
                </div>
                <div className="pl-4">
                  <span className="text-purple-400">const</span> success ={" "}
                  <span className="text-blue-400">await</span>{" "}
                  <span className="text-yellow-400">practice</span>(
                  <span className="text-orange-400">'consistently'</span>
                  <span>);</span>
                </div>
                <div className="pl-4">
                  <span className="text-purple-400">if</span> (success) {"{"}
                </div>
                <div className="pl-8">
                  <span className="text-purple-400">return</span>{" "}
                  <span className="text-orange-400">'Dream Job Offer'</span>;
                </div>
                <div className="pl-4">{"}"}</div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="py-2 pb-12 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">300+</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Curated Problems
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">20+</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Topics Covered
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">100+</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Companies Covered
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
                  <CardTitle>Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Mark problems as solved and track your progress over time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Database className="h-8 w-8 mb-2 text-blue-500" />
                  <CardTitle>Organized Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Problems organized by topics, difficulty, and companies.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Code className="h-8 w-8 mb-2 text-purple-500" />
                  <CardTitle>Coding Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Learn common patterns to solve similar problems efficiently.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileEdit className="h-8 w-8 mb-2 text-orange-500" />
                  <CardTitle>Personalized Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Add quick tips to master key concepts per problem.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to improve your coding skills?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the community of developers using GrindSheet, a powerful
              problem tracker to help you stay organized and focused on your DSA
              preparation for technical interviews.
            </p>
            <Button
              className="hover:cursor-pointer"
              size="lg"
              onClick={() => setIsDialogOpen(true)}
            >
              Get Started Now
            </Button>
            <div className="mt-10">
              <Badge variant="secondary" className="text-sm">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                <span>{onlineUsers} Users Online Now</span>
              </Badge>
            </div>
          </div>
        </section>
      </main>

      {/* FAQ Section */}
      <section
        ref={faqRef}
        className="py-16 bg-gray-50 dark:bg-gray-900"
        id="faqs"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Discover GrindSheet
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="hover:cursor-pointer text-left">
                  What is GrindSheet?
                </AccordionTrigger>
                <AccordionContent>
                  GrindSheet is a comprehensive platform designed to help
                  developers track their progress in solving Data Structures and
                  Algorithms problems. It organizes problems by topics,
                  difficulty levels, and companies, making it easier to prepare
                  for technical interviews.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="hover:cursor-pointer text-left">
                  Is GrindSheet free to use?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, GrindSheet is completely free to use. We believe in
                  making quality interview preparation resources accessible to
                  everyone.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="hover:cursor-pointer text-left">
                  How do I track my progress?
                </AccordionTrigger>
                <AccordionContent>
                  After creating an account, you can mark problems as solved,
                  bookmark important problems, and add notes to track your
                  understanding.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="hover:cursor-pointer text-left">
                  Can I sync my LeetCode or GeeksForGeeks progress?
                </AccordionTrigger>
                <AccordionContent>
                  Currently, we don't have automatic syncing with other
                  platforms. However, you can manually mark problems as solved
                  in GrindSheet to keep track of your progress across different
                  platforms.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="hover:cursor-pointer text-left">
                  How are the problems organized?
                </AccordionTrigger>
                <AccordionContent>
                  Problems are organized by topics (like Arrays, Linked Lists,
                  Dynamic Programming), difficulty levels (Easy, Medium, Hard),
                  and companies that frequently ask these questions in
                  interviews. This organization helps you focus your preparation
                  based on your specific needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="hover:cursor-pointer text-left">
                  Can I contribute to GrindSheet?
                </AccordionTrigger>
                <AccordionContent>
                  We welcome contributions from the community! We're excited to
                  announce that we will be setting up a Discord server where you
                  can suggest new problems, share improvements, and report any
                  issues. Stay tuned for more details on how to join and
                  participate!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-4 md:py-6 bg-gray-100 dark:bg-gray-900`}>
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
              © {new Date().getFullYear()} GrindSheet. All rights reserved.
            </p>

            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2">
              <span>
                Made with <span className="text-red-500 mx-1">♥</span> by{" "}
                <a
                  href="https://aftaab.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {" "}
                  Aftaab{" "}
                </a>
              </span>
              <span className="hidden md:inline mx-2">•</span>
              <span>
                Designed by{" "}
                <a
                  href="https://shifasiddiqui.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {" "}
                  Shifa{" "}
                </a>
              </span>
            </p>
            <Badge
              variant="outline"
              className="mt-2 font-normal bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 rounded-lg px-3 py-1"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Version · v1.0.5
            </Badge>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {/* <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold mb-1">
              Welcome to GrindSheet
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="flex justify-center mb-4">
              <Badge
                variant="destructive"
                className="text-center bg-red-500 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-transform hover:scale-105 whitespace-normal break-words"
              >
                {error}
              </Badge>
            </div>
          )}

          {successMessage && (
            <div className="flex justify-center mb-4">
              <Badge
                variant="secondary"
                className="text-center bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-transform hover:scale-105 whitespace-normal break-words"
              >
                {successMessage}
              </Badge>
            </div>
          )}

          <Tabs
            defaultValue="login"
            className="w-full"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger className="hover:cursor-pointer" value="login">
                Login
              </TabsTrigger>
              <TabsTrigger className="hover:cursor-pointer" value="register">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="johndoe"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className="hover:cursor-pointer text-sm text-blue-600 hover:underline dark:text-blue-400"
                    onClick={() => setActiveTab("forgot-password")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="hover:cursor-pointer w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="johndoe"
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData({ ...signupData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-leetcode-username">
                    LeetCode Username
                  </Label>
                  <Input
                    id="signup-leetcode-username"
                    type="text"
                    placeholder="johndoe.leetcode"
                    value={signupData.leetcodeUsername}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        leetcodeUsername: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gfg-username">GFG Username</Label>
                  <Input
                    id="signup-gfg-username"
                    type="text"
                    placeholder="johndoe.gfg"
                    value={signupData.gfgUsername}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        gfgUsername: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="hover:cursor-pointer w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  * Required fields
                </p>
              </form>
            </TabsContent>

            <TabsContent value="forgot-password" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-password-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="forgot-password-email"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={forgotPasswordData.email}
                    onChange={(e) =>
                      setForgotPasswordData({
                        ...forgotPasswordData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    onClick={() => setActiveTab("login")}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog> */}

      {/* Auth Modal */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold mb-1">
              Welcome to GrindSheet
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="flex justify-center mb-4">
              <Badge
                variant="destructive"
                className="text-center bg-red-500 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-transform hover:scale-105 whitespace-normal break-words"
              >
                {error}
              </Badge>
            </div>
          )}

          {successMessage && (
            <div className="flex justify-center mb-4">
              <Badge
                variant="secondary"
                className="text-center bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-transform hover:scale-105 whitespace-normal break-words"
              >
                {successMessage}
              </Badge>
            </div>
          )}

          <Tabs
            defaultValue="login"
            className="w-full"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger className="hover:cursor-pointer" value="login">
                Login
              </TabsTrigger>
              <TabsTrigger className="hover:cursor-pointer" value="register">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="johndoe"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className="hover:cursor-pointer text-sm text-blue-600 hover:underline dark:text-blue-400"
                    onClick={() => setActiveTab("forgot-password")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="hover:cursor-pointer w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="johndoe"
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData({ ...signupData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-leetcode-username">
                    LeetCode Username
                  </Label>
                  <Input
                    id="signup-leetcode-username"
                    type="text"
                    placeholder="johndoe.leetcode"
                    value={signupData.leetcodeUsername}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        leetcodeUsername: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gfg-username">GFG Username</Label>
                  <Input
                    id="signup-gfg-username"
                    type="text"
                    placeholder="johndoe.gfg"
                    value={signupData.gfgUsername}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        gfgUsername: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="hover:cursor-pointer w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  * Required fields
                </p>
              </form>
            </TabsContent>

            <TabsContent value="forgot-password" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-password-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="forgot-password-email"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={forgotPasswordData.email}
                    onChange={(e) =>
                      setForgotPasswordData({
                        ...forgotPasswordData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    onClick={() => setActiveTab("login")}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add keyframes for blob animation */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
