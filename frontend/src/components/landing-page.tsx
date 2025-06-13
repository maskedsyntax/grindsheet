// "use client";

// import type React from "react";

// import { useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   ArrowRight,
//   Brain,
//   ChevronRight,
//   Code,
//   GraduationCap,
//   LineChart,
//   Star,
//   Target,
//   Trophy,
//   Users,
// } from "lucide-react";

// interface LandingPageProps {
//   onLogin: (credentials: { username: string; password: string }) => void;
//   onSignup: (userData: {
//     fullName: string;
//     username: string;
//     email: string;
//     password: string;
//     leetcodeUsername?: string;
//     gfgUsername?: string;
//   }) => void;
// }

// export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

//   // Login form state
//   const [loginData, setLoginData] = useState({
//     username: "",
//     password: "",
//   });

//   // Signup form state
//   const [signupData, setSignupData] = useState({
//     fullName: "",
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     leetcodeUsername: "",
//     gfgUsername: "",
//   });

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     onLogin(loginData);
//   };

//   const handleSignup = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (signupData.password !== signupData.confirmPassword) {
//       alert("Passwords don't match!");
//       return;
//     }
//     onSignup({
//       fullName: signupData.fullName,
//       username: signupData.username,
//       email: signupData.email,
//       password: signupData.password,
//       leetcodeUsername: signupData.leetcodeUsername || undefined,
//       gfgUsername: signupData.gfgUsername || undefined,
//     });
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
//       {/* Header */}
//       <header className="bg-white dark:bg-black py-4 border-b border-gray-200 dark:border-gray-800">
//         <div className="container mx-auto px-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="bg-black text-white dark:bg-white dark:text-black h-10 w-10 flex items-center justify-center rounded-lg font-bold text-xl">
//               G
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-black dark:text-white">
//                 GrindSheet
//               </h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Track. Solve. Improve.
//               </p>
//             </div>
//           </div>
//           <Button
//             onClick={() => setIsAuthModalOpen(true)}
//             className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
//           >
//             Get Started
//           </Button>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="py-20 px-4">
//         <div className="max-w-5xl mx-auto text-center">
//           <Badge className="mb-6 px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
//             <GraduationCap className="h-4 w-4 mr-2" />
//             Master Data Structures & Algorithms
//           </Badge>

//           <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
//             Ace Your Technical Interviews
//           </h1>

//           <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
//             The ultimate DSA tracking platform that transforms how you prepare
//             for coding interviews. Track progress, master patterns, and land
//             your dream job.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
//             <Button
//               size="lg"
//               onClick={() => setIsAuthModalOpen(true)}
//               className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8"
//             >
//               Start Tracking Now
//               <ArrowRight className="ml-2 h-5 w-5" />
//             </Button>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
//               <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
//                 500+
//               </div>
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Curated Problems
//               </div>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
//               <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
//                 15+
//               </div>
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 DSA Topics
//               </div>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
//               <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
//                 5
//               </div>
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Major Platforms
//               </div>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
//               <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
//                 100%
//               </div>
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Success Rate
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 px-4 bg-white dark:bg-gray-800">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
//               Why GrindSheet Works
//             </h2>
//             <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               Built by engineers, for engineers. Every feature designed to
//               maximize your interview success rate.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
//               <CardHeader>
//                 <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//                   <Target className="h-6 w-6 text-gray-900 dark:text-gray-100" />
//                 </div>
//                 <CardTitle>Smart Topic Organization</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Problems organized by patterns and topics. Master one concept
//                   at a time with our intelligent categorization system.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
//               <CardHeader>
//                 <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//                   <Trophy className="h-6 w-6 text-gray-900 dark:text-gray-100" />
//                 </div>
//                 <CardTitle>Progress Tracking</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Level up your skills with our achievement system. Track
//                   streaks, earn badges, and compete with yourself.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
//               <CardHeader>
//                 <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//                   <Brain className="h-6 w-6 text-gray-900 dark:text-gray-100" />
//                 </div>
//                 <CardTitle>Smart Insights</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Get personalized recommendations and identify weak areas with
//                   our intelligent analysis engine.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
//               <CardHeader>
//                 <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//                   <Users className="h-6 w-6 text-gray-900 dark:text-gray-100" />
//                 </div>
//                 <CardTitle>Company-Specific Prep</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Target specific companies with curated problem sets. Know
//                   exactly what Google, Meta, and Amazon ask.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
//               <CardHeader>
//                 <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//                   <LineChart className="h-6 w-6 text-gray-900 dark:text-gray-100" />
//                 </div>
//                 <CardTitle>Advanced Analytics</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Deep dive into your performance with detailed analytics. Time
//                   complexity, space complexity, and more.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
//               <CardHeader>
//                 <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//                   <Code className="h-6 w-6 text-gray-900 dark:text-gray-100" />
//                 </div>
//                 <CardTitle>Interview Simulation</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Practice under pressure with our timed interview mode. Build
//                   confidence before the real deal.
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA Section */}
//       <section className="py-20 px-4">
//         <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-10 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
//           <div className="flex justify-center mb-6">
//             <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
//               <Star className="h-8 w-8 text-gray-900 dark:text-gray-100" />
//             </div>
//           </div>
//           <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
//             Ready to Ace Your Next Interview?
//           </h2>
//           <p className="text-lg mb-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//             Join the elite circle of developers who've cracked technical
//             interviews using GrindSheet. Your dream job is just one click away.
//           </p>
//           <Button
//             size="lg"
//             onClick={() => setIsAuthModalOpen(true)}
//             className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8"
//           >
//             Get Started Now
//             <ChevronRight className="ml-2 h-5 w-5" />
//           </Button>
//         </div>
//       </section>

// {/* Footer */}
// <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto bg-white dark:bg-black">
//   <div className="container mx-auto px-4">
//     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//       <div className="text-center md:text-left">
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           © {new Date().getFullYear()} GrindSheet. All rights reserved.
//         </p>
//       </div>
//       <div className="text-sm text-gray-600 dark:text-gray-400">
//         Made with ♥ by Aftaab Siddiqui • Designed by Shifa Siddiqui
//       </div>
//     </div>
//   </div>
// </footer>

//       {/* Auth Modal */}
//       <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-center text-xl font-semibold mb-1">
//               Welcome to GrindSheet
//             </DialogTitle>
//           </DialogHeader>

//           <Tabs defaultValue="login" className="w-full">
//             <TabsList className="grid w-full grid-cols-2 mb-6">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="register">Register</TabsTrigger>
//             </TabsList>

//             <TabsContent value="login" className="space-y-4">
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="login-username">Username</Label>
//                   <Input
//                     id="login-username"
//                     type="text"
//                     placeholder="Enter your username"
//                     value={loginData.username}
//                     onChange={(e) =>
//                       setLoginData({ ...loginData, username: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="login-password">Password</Label>
//                   <Input
//                     id="login-password"
//                     type="password"
//                     placeholder="Enter your password"
//                     value={loginData.password}
//                     onChange={(e) =>
//                       setLoginData({ ...loginData, password: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
//                 >
//                   Sign In
//                 </Button>
//               </form>
//             </TabsContent>

//             <TabsContent value="register" className="space-y-4">
//               <form onSubmit={handleSignup} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-fullname">
//                     Full Name <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-fullname"
//                     type="text"
//                     placeholder="Enter your full name"
//                     value={signupData.fullName}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, fullName: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-username">
//                     Username <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-username"
//                     type="text"
//                     placeholder="Choose a username"
//                     value={signupData.username}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, username: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-email">
//                     Email Address <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-email"
//                     type="email"
//                     placeholder="Enter your email address"
//                     value={signupData.email}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, email: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-password">
//                     Password <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-password"
//                     type="password"
//                     placeholder="Create a password"
//                     value={signupData.password}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, password: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-confirm-password">
//                     Confirm Password <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-confirm-password"
//                     type="password"
//                     placeholder="Confirm your password"
//                     value={signupData.confirmPassword}
//                     onChange={(e) =>
//                       setSignupData({
//                         ...signupData,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
//                 >
//                   Create Account
//                 </Button>
//                 <p className="text-xs text-center text-gray-500">
//                   * Required fields
//                 </p>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// ------------------------------------------------------------------

// "use client";

// import type React from "react";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { CheckCircle, Code, Database, LineChart } from "lucide-react";

// export function LandingPage() {
//   const router = useRouter();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("login");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");

//   // Login form state
//   const [loginData, setLoginData] = useState({
//     username: "",
//     password: "",
//   });

//   // Signup form state
//   const [signupData, setSignupData] = useState({
//     fullName: "",
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     leetcodeUsername: "",
//     gfgUsername: "",
//   });

//   const handleAuth = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Set both auth keys for consistency
//     localStorage.setItem("isAuthenticated", "true");
//     localStorage.setItem("auth", "true");
//     console.log("Login successful, redirecting to /problemset");
//     router.push("/problemset");
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Header */}
//       <header className="border-b bg-white dark:bg-gray-950">
//         <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="bg-black text-white dark:bg-white dark:text-black h-10 w-10 flex items-center justify-center rounded-lg font-bold text-xl">
//               G
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">GrindSheet</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Track. Solve. Improve.
//               </p>
//             </div>
//           </div>
//           <Button onClick={() => setIsDialogOpen(true)}>Get Started</Button>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="flex-grow">
//         {/* Hero section */}
//         <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
//           <div className="container mx-auto px-4 text-center">
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
//               Master Data Structures & Algorithms
//             </h1>
//             <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
//               Track your progress, organize your practice, and improve your
//               coding skills with our comprehensive DSA tracker.
//             </p>
//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <Button size="lg" onClick={() => setIsDialogOpen(true)}>
//                 Start Tracking Now
//               </Button>
//               <Button size="lg" variant="outline">
//                 Learn More
//               </Button>
//             </div>
//           </div>
//         </section>

//         {/* Stats section */}
//         <section className="py-12 bg-white dark:bg-gray-950">
//           <div className="container mx-auto px-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <div className="text-center">
//                 <p className="text-4xl font-bold mb-2">500+</p>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Curated Problems
//                 </p>
//               </div>
//               <div className="text-center">
//                 <p className="text-4xl font-bold mb-2">20+</p>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Topics Covered
//                 </p>
//               </div>
//               <div className="text-center">
//                 <p className="text-4xl font-bold mb-2">100+</p>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Companies' Questions
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features section */}
//         <section className="py-16 bg-gray-50 dark:bg-gray-900">
//           <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center mb-12">
//               Key Features
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//               <Card>
//                 <CardHeader>
//                   <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
//                   <CardTitle>Track Progress</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription>
//                     Mark problems as solved and track your progress over time.
//                   </CardDescription>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <Database className="h-8 w-8 mb-2 text-blue-500" />
//                   <CardTitle>Organized Topics</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription>
//                     Problems organized by topics, difficulty, and companies.
//                   </CardDescription>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <Code className="h-8 w-8 mb-2 text-purple-500" />
//                   <CardTitle>Coding Patterns</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription>
//                     Learn common patterns to solve similar problems efficiently.
//                   </CardDescription>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <LineChart className="h-8 w-8 mb-2 text-orange-500" />
//                   <CardTitle>Performance Analytics</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription>
//                     Visualize your progress and identify areas for improvement.
//                   </CardDescription>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* CTA section */}
//         <section className="py-16 bg-white dark:bg-gray-950">
//           <div className="container mx-auto px-4 text-center">
//             <h2 className="text-3xl font-bold mb-6">
//               Ready to improve your coding skills?
//             </h2>
//             <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
//               Join thousands of developers who use GrindSheet to prepare for
//               technical interviews and master DSA.
//             </p>
//             <Button size="lg" onClick={() => setIsDialogOpen(true)}>
//               Get Started Now
//             </Button>
//           </div>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className="py-8 bg-gray-100 dark:bg-gray-900">
//         <div className="container mx-auto px-4 text-center">
//           <p className="text-gray-600 dark:text-gray-400">
//             &copy; {new Date().getFullYear()} GrindSheet. All rights reserved.
//           </p>
//         </div>
//       </footer>

//       {/* Auth Modal */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-center text-xl font-semibold mb-1">
//               Welcome to GrindSheet
//             </DialogTitle>
//           </DialogHeader>

//           <Tabs defaultValue="login" className="w-full">
//             <TabsList className="grid w-full grid-cols-2 mb-6">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="register">Register</TabsTrigger>
//             </TabsList>

//             <TabsContent value="login" className="space-y-4">
//               <form onSubmit={handleAuth} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="login-username">Username</Label>
//                   <Input
//                     id="login-username"
//                     type="text"
//                     placeholder="Enter your username"
//                     value={loginData.username}
//                     onChange={(e) =>
//                       setLoginData({ ...loginData, username: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="login-password">Password</Label>
//                   <Input
//                     id="login-password"
//                     type="password"
//                     placeholder="Enter your password"
//                     value={loginData.password}
//                     onChange={(e) =>
//                       setLoginData({ ...loginData, password: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
//                 >
//                   Sign In
//                 </Button>
//               </form>
//             </TabsContent>

//             <TabsContent value="register" className="space-y-4">
//               <form onSubmit={handleAuth} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-fullname">
//                     Full Name <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-fullname"
//                     type="text"
//                     placeholder="Enter your full name"
//                     value={signupData.fullName}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, fullName: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-username">
//                     Username <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-username"
//                     type="text"
//                     placeholder="Choose a username"
//                     value={signupData.username}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, username: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-email">
//                     Email Address <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-email"
//                     type="email"
//                     placeholder="Enter your email address"
//                     value={signupData.email}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, email: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-password">
//                     Password <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-password"
//                     type="password"
//                     placeholder="Create a password"
//                     value={signupData.password}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, password: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-confirm-password">
//                     Confirm Password <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="signup-confirm-password"
//                     type="password"
//                     placeholder="Confirm your password"
//                     value={signupData.confirmPassword}
//                     onChange={(e) =>
//                       setSignupData({
//                         ...signupData,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
//                 >
//                   Create Account
//                 </Button>
//                 <p className="text-xs text-center text-gray-500">
//                   * Required fields
//                 </p>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// ------------------------------------------------------------------

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
import { CheckCircle, Code, Database, LineChart } from "lucide-react";

export function LandingPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      <header className="border-b bg-white dark:bg-gray-950">
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
          </div>
        </section>
      </main>

      {/* Footer */}
      {/* <footer className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} GrindSheet. All rights reserved.
          </p>
        </div>
      </footer> */}

      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} GrindSheet. All rights reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Made with ♥ by Aftaab Siddiqui • Designed by Shifa Siddiqui
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
