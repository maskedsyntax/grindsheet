// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ExternalLink, Loader2, RefreshCw, Calendar } from "lucide-react";

// interface ProblemData {
//   date: string;
//   title: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   topics: string[];
//   url: string;
// }

// export function ProblemOfTheDay() {
//   const [problem, setProblem] = useState<ProblemData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProblem = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//       if (!apiUrl) {
//         throw new Error("NEXT_PUBLIC_API_URL is not configured.");
//       }
//       const response = await fetch(`${apiUrl}/leetcode-daily`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("jwt_token") || ""}`,
//         },
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         if (response.status === 401) {
//           throw new Error(
//             "Unauthorized: Please log in to access this feature."
//           );
//         } else if (response.status === 503) {
//           throw new Error(
//             "Service temporarily unavailable. Please try again later."
//           );
//         } else if (response.status === 500) {
//           throw new Error(
//             "Failed to fetch LeetCode daily problem. Please try again later."
//           );
//         } else {
//           throw new Error(
//             `HTTP error! status: ${response.status} - ${errorText}`
//           );
//         }
//       }
//       const data = await response.json();
//       setProblem(data);
//     } catch (e: any) {
//       console.error("Failed to fetch problem of the day:", e);
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProblem();
//   }, [fetchProblem]);

//   const getDifficultyColor = (difficulty: ProblemData["difficulty"]) => {
//     switch (difficulty) {
//       case "Easy":
//         return "bg-green-500 hover:bg-green-600";
//       case "Medium":
//         return "bg-yellow-500 hover:bg-yellow-600";
//       case "Hard":
//         return "bg-red-500 hover:bg-red-600";
//       default:
//         return "bg-gray-500 hover:bg-gray-600";
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const options: Intl.DateTimeFormatOptions = {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   return (
//     <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-0 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50">
//       {/* Background decoration */}
//       <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/5 dark:to-transparent" />
//       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent dark:from-blue-400/10 rounded-full -translate-y-16 translate-x-16" />
//       <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent dark:from-indigo-400/10 rounded-full translate-y-12 -translate-x-12" />

//       <CardHeader className="relative pb-2">
//         <div className="hidden md:flex items-center justify-between">
//           <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
//                 LeetCode Problem of the Day
//               </h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
//                 Solve today's challenge
//               </p>
//             </div>
//           </CardTitle>
//           <span className="text-sm text-slate-500 dark:text-slate-400">
//             {problem
//               ? formatDate(problem.date)
//               : formatDate(new Date().toISOString().split("T")[0])}
//           </span>
//         </div>
//         <div className="flex md:hidden flex-col items-center justify-between space-y-2">
//           <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
//                 LeetCode Problem of the Day
//               </h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1">
//                 <Calendar className="h-4 w-4" />
//                 {problem
//                   ? formatDate(problem.date)
//                   : formatDate(new Date().toISOString().split("T")[0])}
//               </p>
//             </div>
//           </CardTitle>
//         </div>
//       </CardHeader>
//       <CardContent className="relative space-y-4">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
//             <p className="mt-4 text-slate-600 dark:text-slate-400">
//               Loading problem...
//             </p>
//           </div>
//         ) : error ? (
//           <div className="flex flex-col items-center justify-center py-6 text-center">
//             <p className="text-red-500 mb-4">{error}</p>
//             <Button onClick={fetchProblem} variant="outline">
//               <RefreshCw className="h-4 w-4 mr-2" /> Retry
//             </Button>
//           </div>
//         ) : problem ? (
//           <div className="md:flex md:gap-4">
//             <div className="w-full md:w-4/5">
//               <div className="p-4 space-y-4">
//                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-left">
//                   {problem.title}
//                 </h3>
//                 <div className="flex  gap-2">
//                   <Badge
//                     className={`${getDifficultyColor(
//                       problem.difficulty
//                     )} text-white`}
//                   >
//                     {problem.difficulty}
//                   </Badge>
//                   {problem.topics.map((topic) => (
//                     <Badge
//                       key={topic}
//                       variant="secondary"
//                       className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
//                     >
//                       {topic}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <div className="w-full md:w-1/5 mt-4 md:mt-0">
//               <div className="p-2 space-y-4">
//                 <div>
//                   <Button
//                     size="sm"
//                     asChild
//                     className="text-sm w-full bg-violet-950 hover:bg-purple-700 text-white"
//                   >
//                     <a
//                       href={problem.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Solve Now <ExternalLink className="ml-2 h-4 w-4" />
//                     </a>
//                   </Button>
//                 </div>
//                 <div>
//                   <Button
//                     size="sm"
//                     onClick={fetchProblem}
//                     variant="outline"
//                     className="text-sm w-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2" /> Refresh
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : null}
//         {problem && (
//           <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
//             <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
//               Daily Tip:
//             </p>
//             <p className="text-sm text-slate-600 dark:text-slate-400">
//               "Consistency is key. Even 30 minutes of focused practice daily can
//               lead to significant improvement over time."
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ExternalLink, Loader2, RefreshCw, Calendar } from "lucide-react";

// interface ProblemData {
//   date: string;
//   title: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   topics: string[];
//   url: string;
// }

// export function ProblemOfTheDay() {
//   const [problem, setProblem] = useState<ProblemData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProblem = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//       if (!apiUrl) {
//         throw new Error("NEXT_PUBLIC_API_URL is not configured.");
//       }
//       const response = await fetch(`${apiUrl}/leetcode-daily`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("jwt_token") || ""}`,
//         },
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         if (response.status === 401) {
//           throw new Error(
//             "Unauthorized: Please log in to access this feature."
//           );
//         } else if (response.status === 503) {
//           throw new Error(
//             "Service temporarily unavailable. Please try again later."
//           );
//         } else if (response.status === 500) {
//           throw new Error(
//             "Failed to fetch LeetCode daily problem. Please try again later."
//           );
//         } else {
//           throw new Error(
//             `HTTP error! status: ${response.status} - ${errorText}`
//           );
//         }
//       }
//       const data = await response.json();
//       setProblem(data);
//     } catch (e: any) {
//       console.error("Failed to fetch problem of the day:", e);
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProblem();
//   }, [fetchProblem]);

//   const getDifficultyColor = (difficulty: ProblemData["difficulty"]) => {
//     switch (difficulty) {
//       case "Easy":
//         return "bg-green-500 hover:bg-green-600";
//       case "Medium":
//         return "bg-yellow-500 hover:bg-yellow-600";
//       case "Hard":
//         return "bg-red-500 hover:bg-red-600";
//       default:
//         return "bg-gray-500 hover:bg-gray-600";
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const options: Intl.DateTimeFormatOptions = {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   return (
//     <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-0 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50">
//       {/* Background decoration */}
//       <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/5 dark:to-transparent" />
//       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent dark:from-blue-400/10 rounded-full -translate-y-16 translate-x-16" />
//       <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent dark:from-indigo-400/10 rounded-full translate-y-12 -translate-x-12" />

//       <CardHeader className="relative pb-2">
//         <div className="hidden md:flex items-center justify-between">
//           <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
//                 LeetCode Problem of the Day
//               </h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 font-normal text-left">
//                 Solve today's challenge
//               </p>
//             </div>
//           </CardTitle>
//           <span className="text-sm text-slate-500 dark:text-slate-400">
//             {problem
//               ? formatDate(problem.date)
//               : formatDate(new Date().toISOString().split("T")[0])}
//           </span>
//         </div>
//         <div className="flex md:hidden flex-col items-center justify-between space-y-2">
//           <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div className="text-center">
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
//                 LeetCode Problem of the Day
//               </h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 font-normal flex items-center justify-center gap-1">
//                 <Calendar className="h-4 w-4" />
//                 {problem
//                   ? formatDate(problem.date)
//                   : formatDate(new Date().toISOString().split("T")[0])}
//               </p>
//             </div>
//           </CardTitle>
//         </div>
//       </CardHeader>
//       <CardContent className="relative space-y-4">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
//             <p className="mt-4 text-slate-600 dark:text-slate-400">
//               Loading problem...
//             </p>
//           </div>
//         ) : error ? (
//           <div className="flex flex-col items-center justify-center py-6 text-center">
//             <p className="text-red-500 mb-4">{error}</p>
//             <Button onClick={fetchProblem} variant="outline">
//               <RefreshCw className="h-4 w-4 mr-2" /> Retry
//             </Button>
//           </div>
//         ) : problem ? (
//           <div className="md:flex md:gap-4">
//             <div className="w-full md:w-4/5">
//               <div className="p-4 space-y-4">
//                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-left text-center">
//                   {problem.title}
//                 </h3>
//                 <div className="flex md:justify-start justify-center items-center gap-2">
//                   <Badge
//                     className={`${getDifficultyColor(
//                       problem.difficulty
//                     )} text-white`}
//                   >
//                     {problem.difficulty}
//                   </Badge>
//                   {problem.topics.map((topic) => (
//                     <Badge
//                       key={topic}
//                       variant="secondary"
//                       className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
//                     >
//                       {topic}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <div className="w-full md:w-1/5 mt-4 md:mt-0">
//               <div className="p-2 space-y-4">
//                 <div>
//                   <Button
//                     size="sm"
//                     asChild
//                     className="text-sm w-full bg-indigo-600 hover:bg-indigo-700 text-white"
//                   >
//                     <a
//                       href={problem.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Solve Now <ExternalLink className="ml-2 h-4 w-4" />
//                     </a>
//                   </Button>
//                 </div>
//                 <div>
//                   <Button
//                     size="sm"
//                     onClick={fetchProblem}
//                     variant="outline"
//                     className="text-sm w-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2" /> Refresh
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : null}
//         {problem && (
//           <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
//             <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
//               Daily Tip:
//             </p>
//             <p className="text-sm text-slate-600 dark:text-slate-400">
//               "Consistency is key. Even 30 minutes of focused practice daily can
//               lead to significant improvement over time."
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ExternalLink, Loader2, RefreshCw, Calendar } from "lucide-react";

// interface ProblemData {
//   date: string;
//   title: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   topics: string[];
//   url: string;
// }

// export function ProblemOfTheDay() {
//   const [problem, setProblem] = useState<ProblemData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProblem = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//       if (!apiUrl) {
//         throw new Error("NEXT_PUBLIC_API_URL is not configured.");
//       }
//       const response = await fetch(`${apiUrl}/leetcode-daily`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("jwt_token") || ""}`,
//         },
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         if (response.status === 401) {
//           throw new Error(
//             "Unauthorized: Please log in to access this feature."
//           );
//         } else if (response.status === 503) {
//           throw new Error(
//             "Service temporarily unavailable. Please try again later."
//           );
//         } else if (response.status === 500) {
//           throw new Error(
//             "Failed to fetch LeetCode daily problem. Please try again later."
//           );
//         } else {
//           throw new Error(
//             `HTTP error! status: ${response.status} - ${errorText}`
//           );
//         }
//       }
//       const data = await response.json();
//       setProblem(data);
//     } catch (e: any) {
//       console.error("Failed to fetch problem of the day:", e);
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProblem();
//   }, [fetchProblem]);

//   const getDifficultyColor = (difficulty: ProblemData["difficulty"]) => {
//     switch (difficulty) {
//       case "Easy":
//         return "bg-green-500 hover:bg-green-600";
//       case "Medium":
//         return "bg-yellow-500 hover:bg-yellow-600";
//       case "Hard":
//         return "bg-red-500 hover:bg-red-600";
//       default:
//         return "bg-gray-500 hover:bg-gray-600";
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const options: Intl.DateTimeFormatOptions = {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   return (
//     <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-0 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50">
//       {/* Background decoration */}
//       <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/5 dark:to-transparent" />
//       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent dark:from-blue-400/10 rounded-full -translate-y-16 translate-x-16" />
//       <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent dark:from-indigo-400/10 rounded-full translate-y-12 -translate-x-12" />

//       <CardHeader className="relative pb-2">
//         <div className="hidden md:flex items-center justify-between">
//           <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
//                 LeetCode Problem of the Day
//               </h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
//                 Solve today's challenge
//               </p>
//             </div>
//           </CardTitle>
//           <span className="text-sm text-slate-500 dark:text-slate-400">
//             {problem
//               ? formatDate(problem.date)
//               : formatDate(new Date().toISOString().split("T")[0])}
//           </span>
//         </div>
//         <div className="flex md:hidden flex-col items-start justify-between space-y-2">
//           <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-5 w-5 text-white"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
//                 LeetCode Problem of the Day
//               </h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
//                 Solve today's challenge
//               </p>
//             </div>
//           </CardTitle>
//           <p className="text-sm text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1">
//             <Calendar className="h-4 w-4" />
//             {problem
//               ? formatDate(problem.date)
//               : formatDate(new Date().toISOString().split("T")[0])}
//           </p>
//         </div>
//       </CardHeader>
//       <CardContent className="relative space-y-4">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
//             <p className="mt-4 text-slate-600 dark:text-slate-400">
//               Loading problem...
//             </p>
//           </div>
//         ) : error ? (
//           <div className="flex flex-col items-center justify-center py-6 text-center">
//             <p className="text-red-500 mb-4">{error}</p>
//             <Button onClick={fetchProblem} variant="outline">
//               <RefreshCw className="h-4 w-4 mr-2" /> Retry
//             </Button>
//           </div>
//         ) : problem ? (
//           <div className="md:flex md:gap-4">
//             <div className="w-full md:w-4/5">
//               <div className="p-4 space-y-4">
//                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-left text-center">
//                   {problem.title}
//                 </h3>
//                 <div className="flex md:justify-start justify-center items-center gap-2">
//                   <Badge
//                     className={`${getDifficultyColor(
//                       problem.difficulty
//                     )} text-white`}
//                   >
//                     {problem.difficulty}
//                   </Badge>
//                   {problem.topics.map((topic) => (
//                     <Badge
//                       key={topic}
//                       variant="secondary"
//                       className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
//                     >
//                       {topic}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <div className="w-full md:w-1/5 mt-4 md:mt-0">
//               <div className="p-2 space-y-4">
//                 <div>
//                   <Button
//                     size="sm"
//                     asChild
//                     className="text-sm w-full bg-indigo-600 hover:bg-indigo-700 text-white"
//                   >
//                     <a
//                       href={problem.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Solve Now <ExternalLink className="ml-2 h-4 w-4" />
//                     </a>
//                   </Button>
//                 </div>
//                 <div>
//                   <Button
//                     size="sm"
//                     onClick={fetchProblem}
//                     variant="outline"
//                     className="text-sm w-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2" /> Refresh
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : null}
//         {problem && (
//           <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
//             <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
//               Daily Tip:
//             </p>
//             <p className="text-sm text-slate-600 dark:text-slate-400">
//               "Consistency is key. Even 30 minutes of focused practice daily can
//               lead to significant improvement over time."
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, RefreshCw, Calendar } from "lucide-react";

interface ProblemData {
  date: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  url: string;
}

export function ProblemOfTheDay() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }
      const response = await fetch(`${apiUrl}/leetcode-daily`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token") || ""}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error(
            "Unauthorized: Please log in to access this feature."
          );
        } else if (response.status === 503) {
          throw new Error(
            "Service temporarily unavailable. Please try again later."
          );
        } else if (response.status === 500) {
          throw new Error(
            "Failed to fetch LeetCode daily problem. Please try again later."
          );
        } else {
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText}`
          );
        }
      }
      const data = await response.json();
      setProblem(data);
    } catch (e: any) {
      console.error("Failed to fetch problem of the day:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  const getDifficultyColor = (difficulty: ProblemData["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500 hover:bg-green-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-0 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/5 dark:to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent dark:from-blue-400/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent dark:from-indigo-400/10 rounded-full translate-y-12 -translate-x-12" />

      <CardHeader className="relative pb-2">
        <div className="hidden md:flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="flex items-center p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                LeetCode Daily Challenge
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal text-left">
                Solve today's challenge
              </p>
            </div>
          </CardTitle>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {problem
              ? formatDate(problem.date)
              : formatDate(new Date().toISOString().split("T")[0])}
          </span>
        </div>
        <div className="flex md:hidden flex-col items-start justify-between space-y-2">
          <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                LeetCode Daily Challenge
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Solve today's challenge
              </p>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Loading problem...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchProblem} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        ) : problem ? (
          <div className="md:flex md:gap-4">
            <div className="w-full md:w-4/5">
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-left text-center">
                  {problem.title}
                </h3>
                <div className="flex md:justify-start justify-center items-center gap-2">
                  <Badge
                    className={`${getDifficultyColor(
                      problem.difficulty
                    )} text-white`}
                  >
                    {problem.difficulty}
                  </Badge>
                  {problem.topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/5 mt-4 md:mt-0">
              <div className="p-2 space-y-4">
                <div>
                  <Button
                    size="sm"
                    asChild
                    className="text-sm w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Solve Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div>
                  <Button
                    size="sm"
                    onClick={fetchProblem}
                    variant="outline"
                    className="text-sm w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {problem && (
          <div className="text-center mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              Daily Tip:
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              "Consistency is key. Even 30 minutes of focused practice daily can
              lead to significant improvement over time."
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
