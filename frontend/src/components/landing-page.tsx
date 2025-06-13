"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { CheckCircle, Code, Database, LineChart, Users } from "lucide-react";
import { Badge } from "./ui/badge";

export function LandingPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0); // State for online users

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

  // number of online users (5 to 12) on component mount
  useEffect(() => {
    const randomUsers = Math.floor(Math.random() * (12 - 5 + 1)) + 5; // Random number between 5 and 12
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
    setIsLoading(true);

    try {
      let response;
      if (activeTab === "login") {
        // Log the login data to debug
        console.log("Login data:", loginData);

        // Validate fields before sending
        if (!loginData.username || !loginData.password) {
          throw new Error("Username and password are required");
        }

        // Prepare form data for /login
        const formData = new URLSearchParams();
        formData.append("username", loginData.username);
        formData.append("password", loginData.password);
        console.log("Form data being sent:", formData.toString());

        // Call /login API with form data
        response = await fetch("http://localhost:8000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
      } else {
        // Validate confirmPassword for signup
        if (signupData.password !== signupData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        // Call /signup API (this remains as JSON)
        response = await fetch("http://localhost:8000/signup", {
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
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response from server:", errorData);
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await response.json();
      const token = data.access_token;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Store the JWT token
      localStorage.setItem("jwt_token", token);
      console.log(`${activeTab} successful, redirecting to /problemset`);
      router.push("/problemset");
    } catch (err: any) {
      console.error(`${activeTab} error:`, err);
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {/* <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white dark:bg-white dark:text-black h-10 w-10 flex items-center justify-center rounded-lg font-bold text-xl">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold">GrindSheet</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track. Solve. Improve.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>Get Started</Button>
        </div>
      </header> */}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white dark:bg-white dark:text-black h-10 w-10 flex items-center justify-center rounded-lg font-bold text-xl">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold">GrindSheet</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track. Solve. Improve.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>Get Started</Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {/* Hero section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Master Data Structures & Algorithms
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Track your progress, organize your practice, and improve your
              coding skills with our comprehensive DSA tracker.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => setIsDialogOpen(true)}>
                Start Tracking Now
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="py-12 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">500+</p>
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
                  Companies' Questions
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
                  <LineChart className="h-8 w-8 mb-2 text-orange-500" />
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Visualize your progress and identify areas for improvement.
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
              Join thousands of developers who use GrindSheet to prepare for
              technical interviews and master DSA.
            </p>
            <Button size="lg" onClick={() => setIsDialogOpen(true)}>
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

      <footer className="py-6 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} GrindSheet. All rights reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center">
              Made with <span className="text-red-500 mx-1">♥</span> by Aftaab
              Siddiqui <span className="mx-2">•</span> Designed by Shifa
              Siddiqui
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold mb-1">
              Welcome to GrindSheet
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Tabs
            defaultValue="login"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
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
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
                    placeholder="Enter your full name"
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
                    placeholder="Choose a username"
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
                    placeholder="Enter your email address"
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
                    placeholder="Enter your LeetCode username (optional)"
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
                    placeholder="Enter your GFG username (optional)"
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
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  * Required fields
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
