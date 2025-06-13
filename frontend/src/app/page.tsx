// "use client";

// import { useState } from "react";
// import { LandingPage } from "@/components/landing-page";
// import { GrindSheet } from "@/components/grind-sheet";

// export default function Home() {
//   // Simple authentication state - replace this with your actual auth logic
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleLogin = (credentials: { username: string; password: string }) => {
//     // Replace with your actual login logic
//     console.log("Login attempt:", credentials);
//     setIsAuthenticated(true); // For demo purposes
//   };

//   const handleSignup = (userData: {
//     fullName: string;
//     username: string;
//     email: string;
//     password: string;
//     leetcodeUsername?: string;
//     gfgUsername?: string;
//   }) => {
//     // Replace with your actual signup logic
//     console.log("Signup attempt:", userData);
//     setIsAuthenticated(true); // For demo purposes
//   };

//   const handleLogout = () => {
//     // Replace with your actual logout logic
//     console.log("Logout clicked - implement your logout logic here");
//     setIsAuthenticated(false);
//   };

//   // Show landing page if not authenticated, otherwise show the grind sheet
//   if (!isAuthenticated) {
//     return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
//   }

//   return <GrindSheet onLogout={handleLogout} />;
// }

"use client";

import { LandingPage } from "@/components/landing-page";

export default function Home() {
  return <LandingPage />;
}
