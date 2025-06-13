// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { GrindSheet } from "@/components/grind-sheet";

// export default function ProblemsetPage() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     // Check if user is authenticated
//     const auth =
//       localStorage.getItem("auth") || localStorage.getItem("isAuthenticated");
//     console.log("Authentication check:", { auth });

//     if (auth) {
//       setIsAuthenticated(true);
//     } else {
//       router.push("/");
//     }

//     setLoading(false);
//   }, [router]);

//   const handleLogout = () => {
//     // Clear both auth keys for consistency
//     localStorage.removeItem("auth");
//     localStorage.removeItem("isAuthenticated");
//     router.push("/");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null; // This will prevent flash of content before redirect
//   }

//   return <GrindSheet onLogout={handleLogout} />;
// }

// ------------------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GrindSheet } from "@/components/grind-sheet";

export default function ProblemsetPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by verifying the presence of JWT token
    const token = localStorage.getItem("jwt_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push("/");
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Clear JWT token
    localStorage.removeItem("jwt_token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will prevent flash of content before redirect
  }

  return <GrindSheet onLogout={handleLogout} />;
}
