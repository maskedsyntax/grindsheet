// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Suspense } from "react";

// export default function ResetPassword() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setIsLoading(true);

//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match");
//       setIsLoading(false);
//       return;
//     }

//     if (!token) {
//       setError("Invalid or missing token. Please try the reset link again.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             token: token as string,
//             new_password: newPassword,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || "Failed to reset password");
//       }

//       setSuccess(
//         "Password updated successfully! You will be redirected shortly..."
//       );
//       setIsRedirecting(true);
//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     } catch (err: unknown) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to reset password. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
//         <h2 className="text-2xl font-semibold text-center mb-6">
//           Reset Your Password
//         </h2>

//         {error && (
//           <div className="mb-4">
//             <Badge variant="destructive" className="w-full text-center">
//               {error}
//             </Badge>
//           </div>
//         )}

//         {success && (
//           <div className="mb-4">
//             <Badge
//               variant="secondary"
//               className="w-full text-center bg-green-500 text-white"
//             >
//               {success}
//             </Badge>
//             {isRedirecting && (
//               <div className="flex justify-center mt-2">
//                 <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
//               </div>
//             )}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="new-password">New Password</Label>
//             <Input
//               id="new-password"
//               type="password"
//               placeholder="Enter new password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="confirm-password">Confirm Password</Label>
//             <Input
//               id="confirm-password"
//               type="password"
//               placeholder="Confirm new password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div>
//           <Button
//             type="submit"
//             className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
//             disabled={isLoading}
//           >
//             {isLoading ? "Resetting Password..." : "Reset Password"}
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react"; // Import Suspense

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {" "}
      {/* Wrap in Suspense */}
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid or missing token. Please try the reset link again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token as string,
            new_password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reset password");
      }

      setSuccess(
        "Password updated successfully! You will be redirected shortly..."
      );
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      // Changed from 'any' to 'unknown' for type safety
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Reset Your Password
        </h2>

        {error && (
          <div className="mb-4">
            <Badge variant="destructive" className="w-full text-center">
              {error}
            </Badge>
          </div>
        )}

        {success && (
          <div className="mb-4">
            <Badge
              variant="secondary"
              className="w-full text-center bg-green-500 text-white"
            >
              {success}
            </Badge>
            {isRedirecting && (
              <div className="flex justify-center mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="hover:cursor-pointer w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={isLoading}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
