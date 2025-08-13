"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  BookmarkIcon,
  Building2,
  CheckCircle,
  ChevronDown,
  FilterIcon,
  GraduationCap,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tag,
  FileEdit,
  LogOut,
  User,
  Menu,
  ExternalLink,
  TrendingUp,
  EyeOff,
  Bookmark,
  Eye,
  Settings2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "./ui/progress";
import { ProblemOfTheDay } from "./problem-of-the-day";

interface Problem {
  id: number;
  "Problem Name": string;
  Topic: string;
  Difficulty: string;
  Platform: string;
  Link: string;
  Tags: string[];
  Companies: string[];
  "Solved Status": number;
  "Needs Revision": boolean;
  Notes: string;
}

interface UserProblem {
  id: number;
  user_id: number;
  problem_id: number;
  is_solved: boolean;
  is_bookmarked: boolean;
  notes: string;
  updated_at: string;
}

// interface LeetCodeProblemOfTheDay {
//   date: string;
//   title: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   topics: string[];
//   url: string;
// }

interface GrindSheetProps {
  onLogout: () => void;
}

export function GrindSheet({ onLogout }: GrindSheetProps) {
  const [showTags, setShowTags] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([
    "Easy",
    "Medium",
    "Hard",
  ]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "LeetCode",
    "GeeksForGeeks",
    "Coding Ninjas",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Set<string>>(
    new Set()
  );
  const [hideSolved, setHideSolved] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Notes related state
  const [notesMap, setNotesMap] = useState<Map<string, string>>(new Map());
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentProblemForNotes, setCurrentProblemForNotes] =
    useState<string>("");
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [problemIdMap, setProblemIdMap] = useState<Map<string, number>>(
    new Map()
  ); // Map problem name to problem_id
  const [error, setError] = useState("");

  // Function to fetch and process problem data
  const fetchProblems = async () => {
    try {
      // Fetch gsheet_data.json
      const gsheetResponse = await fetch("/assets/data/gsheet_data.json");
      if (!gsheetResponse.ok) {
        throw new Error(
          `Failed to fetch gsheet data: ${gsheetResponse.status} ${gsheetResponse.statusText}`
        );
      }
      const gsheetData: Problem[] = await gsheetResponse.json();

      // Add problem_id to each problem (assuming gsheet_data.json has an "id" field)
      const problemIdMapTemp = new Map<string, number>();
      gsheetData.forEach((problem, index) => {
        // If gsheet_data.json doesn't have an "id" field, you might need to adjust this logic
        const problemId = problem.id || index + 1; // Fallback to index if id is not present
        problemIdMapTemp.set(problem["Problem Name"], problemId);
      });
      setProblemIdMap(problemIdMapTemp);

      // Fetch user-specific problem data from /user-problems
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("No JWT token found. Please log in again.");
      }

      const userProblemsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-problems`, // Updated to Render URL
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userProblemsResponse.ok) {
        if (userProblemsResponse.status === 401) {
          // Unauthorized, redirect to login
          localStorage.removeItem("jwt_token");
          window.location.href = "/";
          return;
        }
        throw new Error(
          `Failed to fetch user problems: ${userProblemsResponse.status} ${userProblemsResponse.statusText}`
        );
      }

      const userProblems: UserProblem[] = await userProblemsResponse.json();

      // Merge user problems with gsheet_data
      const mergedProblems = gsheetData.map((problem) => {
        const userProblem = userProblems.find(
          (up) =>
            up.problem_id === problemIdMapTemp.get(problem["Problem Name"])
        );
        return {
          ...problem,
          "Solved Status": userProblem?.is_solved ? 1 : 0,
          "Needs Revision": userProblem?.is_bookmarked || false,
          Notes: userProblem?.notes || "",
        };
      });

      processProblems(mergedProblems);
    } catch (err: any) {
      console.error("Error loading problem data:", err);
      setError(err.message || "Failed to load problems. Please try again.");
      setLoading(false);
    }
  };

  // Function to process problem data
  const processProblems = (data: Problem[]) => {
    setProblems(data);

    // Extract unique topics
    const uniqueTopics = Array.from(
      new Set(data.map((problem: Problem) => problem.Topic))
    ) as string[];
    setTopics(uniqueTopics);

    // Initialize solved problems from data
    const initialSolved = new Set<string>();
    data.forEach((problem: Problem) => {
      if (problem["Solved Status"] === 1) {
        initialSolved.add(problem["Problem Name"]);
      }
    });
    setSolvedProblems(initialSolved);

    // Initialize bookmarked problems
    const initialBookmarked = new Set<string>();
    data.forEach((problem: Problem) => {
      if (problem["Needs Revision"]) {
        initialBookmarked.add(problem["Problem Name"]);
      }
    });
    setBookmarkedProblems(initialBookmarked);

    // Initialize notes from data
    const initialNotes = new Map<string, string>();
    data.forEach((problem: Problem) => {
      if (problem.Notes && problem.Notes.trim() !== "") {
        initialNotes.set(problem["Problem Name"], problem.Notes);
      }
    });
    setNotesMap(initialNotes);

    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const updateProblem = async (
    problemId: number,
    updates: { is_solved?: boolean; is_bookmarked?: boolean; notes?: string }
  ) => {
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("No JWT token found. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-problems/${problemId}`, // Updated to Render URL
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, redirect to login
          localStorage.removeItem("jwt_token");
          window.location.href = "/";
          return;
        }
        throw new Error(
          `Failed to update problem: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (err: any) {
      console.error("Error updating problem:", err);
      setError(err.message || "Failed to update problem. Please try again.");
    }
  };

  const openNotesDialog = (problemName: string) => {
    setCurrentProblemForNotes(problemName);
    setCurrentNoteText(notesMap.get(problemName) || "");
    setIsNotesDialogOpen(true);
  };

  const saveNotes = async () => {
    const problemId = problemIdMap.get(currentProblemForNotes);
    if (!problemId) {
      setError("Problem ID not found.");
      return;
    }

    await updateProblem(problemId, {
      notes: currentNoteText,
    });

    const newNotesMap = new Map(notesMap);
    if (currentNoteText.trim() === "") {
      newNotesMap.delete(currentProblemForNotes);
    } else {
      newNotesMap.set(currentProblemForNotes, currentNoteText);
    }
    setNotesMap(newNotesMap);
    setIsNotesDialogOpen(false);
  };

  const getProgressStats = () => {
    const totalProblems = problems.length;
    const totalSolved = solvedProblems.size;

    const easyProblems = problems.filter((p) => p.Difficulty === "Easy");
    const mediumProblems = problems.filter((p) => p.Difficulty === "Medium");
    const hardProblems = problems.filter((p) => p.Difficulty === "Hard");

    const easySolved = easyProblems.filter((p) =>
      solvedProblems.has(p["Problem Name"])
    ).length;
    const mediumSolved = mediumProblems.filter((p) =>
      solvedProblems.has(p["Problem Name"])
    ).length;
    const hardSolved = hardProblems.filter((p) =>
      solvedProblems.has(p["Problem Name"])
    ).length;

    return {
      total: { solved: totalSolved, total: totalProblems },
      easy: { solved: easySolved, total: easyProblems.length },
      medium: { solved: mediumSolved, total: mediumProblems.length },
      hard: { solved: hardSolved, total: hardProblems.length },
    };
  };

  const filteredProblems = problems.filter((problem) => {
    const topicMatch =
      selectedTopics.length === 0 || selectedTopics.includes(problem.Topic);
    const difficultyMatch = selectedDifficulties.includes(problem.Difficulty);
    const platformMatch = selectedPlatforms.includes(problem.Platform);
    const searchMatch =
      searchQuery === "" ||
      problem["Problem Name"].toLowerCase().includes(searchQuery.toLowerCase());
    const solvedMatch =
      !hideSolved || !solvedProblems.has(problem["Problem Name"]);
    const bookmarkMatch =
      !showBookmarkedOnly || bookmarkedProblems.has(problem["Problem Name"]);
    return (
      topicMatch &&
      difficultyMatch &&
      platformMatch &&
      searchMatch &&
      solvedMatch &&
      bookmarkMatch
    );
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
      case "hard":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleSolvedStatus = async (problemName: string) => {
    const problemId = problemIdMap.get(problemName);
    if (!problemId) {
      setError("Problem ID not found.");
      return;
    }

    const isCurrentlySolved = solvedProblems.has(problemName);
    await updateProblem(problemId, {
      is_solved: !isCurrentlySolved,
    });

    setSolvedProblems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(problemName)) {
        newSet.delete(problemName);
      } else {
        newSet.add(problemName);
      }
      return newSet;
    });

      // Update problems state to reflect the new Solved Status
      setProblems((prevProblems) =>
          prevProblems.map((problem) =>
              problem["Problem Name"] === problemName
                  ? { ...problem, "Solved Status": isCurrentlySolved ? 0 : 1 }
                  : problem
          )
      );
  };

  const toggleBookmark = async (problemName: string) => {
    const problemId = problemIdMap.get(problemName);
    if (!problemId) {
      setError("Problem ID not found.");
      return;
    }

    const isCurrentlyBookmarked = bookmarkedProblems.has(problemName);
    await updateProblem(problemId, {
      is_bookmarked: !isCurrentlyBookmarked,
    });

    setBookmarkedProblems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(problemName)) {
        newSet.delete(problemName);
      } else {
        newSet.add(problemName);
      }
      return newSet;
    });
  };

  const resetFilters = () => {
    setSelectedTopics([]);
    setSelectedDifficulties(["Easy", "Medium", "Hard"]);
    setSelectedPlatforms(["LeetCode", "GeeksForGeeks", "Coding Ninjas"]);
    setSearchQuery("");
    setHideSolved(false);
    setShowBookmarkedOnly(false);
    setMobileFiltersOpen(false);
  };

  const getActiveFiltersCount = () => {
    return (
      selectedTopics.length +
      (3 - selectedDifficulties.length) +
      (3 - selectedPlatforms.length) +
      (hideSolved ? 1 : 0) +
      (showBookmarkedOnly ? 1 : 0)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if no problems loaded
  if (problems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Unable to load problem data
          </h2>
          <p className="mb-6">
            {error ||
              "There was an error loading the problem data. Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  const progressStats = getProgressStats();

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4 mt-4">
            {error}
          </div>
        )}
        <header className="sticky top-0 z-10 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Track. Solve. Improve.
                </p>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Badge
                variant="outline"
                className="font-normal bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 rounded-lg px-3 py-2"
              >
                <GraduationCap className="h-3 w-3 mr-1" />
                Version · v1.0.5
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:cursor-pointer gap-2"
                  >
                    <User className="h-4 w-4" />
                    Account
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:cursor-pointer"
                      onClick={onLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md">
              <div className="flex flex-col space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </header>

        <section className="container  w-full flex-grow mx-auto px-4 py-6">
          <ProblemOfTheDay />
        </section>

        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="grid gap-6">
            {/* 🆕 NEW: Modern Progress Section */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-0 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/5 dark:to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent dark:from-blue-400/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent dark:from-indigo-400/10 rounded-full translate-y-12 -translate-x-12" />

              <CardHeader className="relative pb-6">
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      Progress Overview
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                      Track your coding journey
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Overall Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Overall Progress
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {progressStats.total.solved}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        / {progressStats.total.total}
                      </span>
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold"
                      >
                        {Math.round(
                          (progressStats.total.solved /
                            progressStats.total.total) *
                            100
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress
                      value={
                        (progressStats.total.solved /
                          progressStats.total.total) *
                        100
                      }
                      className="h-4 bg-slate-200 dark:bg-slate-700 shadow-inner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full" />
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Easy */}
                  <div className="group space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 hover:shadow-lg hover:shadow-green-100/50 dark:hover:shadow-green-900/20 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:text-green-300 dark:border-green-800 font-semibold px-3 py-1"
                      >
                        Easy
                      </Badge>
                      <span className="text-sm font-bold text-green-700 dark:text-green-300">
                        {progressStats.easy.solved}/{progressStats.easy.total}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={
                          progressStats.easy.total > 0
                            ? (progressStats.easy.solved /
                                progressStats.easy.total) *
                              100
                            : 0
                        }
                        className="h-3 bg-green-100 dark:bg-green-900/50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {progressStats.easy.total > 0
                          ? Math.round(
                              (progressStats.easy.solved /
                                progressStats.easy.total) *
                                100
                            )
                          : 0}
                        % Complete
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="group space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 hover:shadow-lg hover:shadow-yellow-100/50 dark:hover:shadow-yellow-900/20 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200 dark:from-yellow-950 dark:to-amber-950 dark:text-yellow-300 dark:border-yellow-800 font-semibold px-3 py-1"
                      >
                        Medium
                      </Badge>
                      <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                        {progressStats.medium.solved}/
                        {progressStats.medium.total}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={
                          progressStats.medium.total > 0
                            ? (progressStats.medium.solved /
                                progressStats.medium.total) *
                              100
                            : 0
                        }
                        className="h-3 bg-yellow-100 dark:bg-yellow-900/50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-400/30 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        {progressStats.medium.total > 0
                          ? Math.round(
                              (progressStats.medium.solved /
                                progressStats.medium.total) *
                                100
                            )
                          : 0}
                        % Complete
                      </span>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Hard */}
                  <div className="group space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 hover:shadow-lg hover:shadow-red-100/50 dark:hover:shadow-red-900/20 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 dark:from-red-950 dark:to-rose-950 dark:text-red-300 dark:border-red-800 font-semibold px-3 py-1"
                      >
                        Hard
                      </Badge>
                      <span className="text-sm font-bold text-red-700 dark:text-red-300">
                        {progressStats.hard.solved}/{progressStats.hard.total}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={
                          progressStats.hard.total > 0
                            ? (progressStats.hard.solved /
                                progressStats.hard.total) *
                              100
                            : 0
                        }
                        className="h-3 bg-red-100 dark:bg-red-900/50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-rose-400/30 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {progressStats.hard.total > 0
                          ? Math.round(
                              (progressStats.hard.solved /
                                progressStats.hard.total) *
                                100
                            )
                          : 0}
                        % Complete
                      </span>
                      <div className="w-2 h-2 bg-red-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter Controls */}

            <div className="space-y-4">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden order-1">
                <Button
                  variant="outline"
                  className="w-full h-12 flex items-center justify-between bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    <span className="font-medium">Filters & Options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getActiveFiltersCount() > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 font-semibold"
                      >
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        mobileFiltersOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </Button>
              </div>

              {/* Filters Panel */}
              <div
                // className="order-2"
                className={`order-2 transition-all duration-300 ease-in-out ${
                  mobileFiltersOpen ? "block" : "hidden lg:block"
                }`}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-lg dark:bg-gray-900/80 dark:border-gray-700/60">
                  <CardContent className="px-6">
                    {/* Mobile Layout */}
                    <div className="lg:hidden space-y-6">
                      {/* Filter Categories */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <FilterIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Filter Categories
                          </h3>
                        </div>

                        <div className="grid gap-3">
                          {/* Topics */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between h-11 bg-gray-50/80 hover:bg-gray-100/80 border-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">Topics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedTopics.length > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-100 text-blue-700 text-xs"
                                    >
                                      {selectedTopics.length}
                                    </Badge>
                                  )}
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-80 max-h-80 overflow-y-auto"
                            >
                              <div className="p-4">
                                <div className="flex flex-wrap gap-2">
                                  {topics.map((topic) => (
                                    <Badge
                                      key={topic}
                                      variant={
                                        selectedTopics.includes(topic)
                                          ? "default"
                                          : "outline"
                                      }
                                      className={`cursor-pointer py-2 px-3 transition-all duration-200 ${
                                        selectedTopics.includes(topic)
                                          ? "bg-blue-600 text-white hover:bg-blue-700"
                                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                                      }`}
                                      onClick={() => handleTopicToggle(topic)}
                                    >
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Difficulty */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between h-11 bg-gray-50/80 hover:bg-gray-100/80 border-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <SlidersHorizontal className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">
                                    Difficulty
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedDifficulties.length < 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-100 text-green-700 text-xs"
                                    >
                                      {selectedDifficulties.length}
                                    </Badge>
                                  )}
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                              <div className="p-4 space-y-3">
                                {["Easy", "Medium", "Hard"].map(
                                  (difficulty) => (
                                    <div
                                      key={difficulty}
                                      className="flex items-center space-x-3"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`${difficulty}-mobile`}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedDifficulties.includes(
                                          difficulty
                                        )}
                                        onChange={() =>
                                          handleDifficultyToggle(difficulty)
                                        }
                                      />
                                      <Label
                                        htmlFor={`${difficulty}-mobile`}
                                        className="text-sm font-medium cursor-pointer flex-1"
                                      >
                                        {difficulty}
                                      </Label>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getDifficultyBadge(
                                          difficulty
                                        )}`}
                                      >
                                        {
                                          problems.filter(
                                            (p) => p.Difficulty === difficulty
                                          ).length
                                        }
                                      </Badge>
                                    </div>
                                  )
                                )}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Platform */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between h-11 bg-gray-50/80 hover:bg-gray-100/80 border-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">Platform</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedPlatforms.length < 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-purple-100 text-purple-700 text-xs"
                                    >
                                      {selectedPlatforms.length}
                                    </Badge>
                                  )}
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                              <div className="p-4 space-y-3">
                                {[
                                  "LeetCode",
                                  "GeeksForGeeks",
                                  "Coding Ninjas",
                                ].map((platform) => (
                                  <div
                                    key={platform}
                                    className="flex items-center space-x-3"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`${platform}-mobile`}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      checked={selectedPlatforms.includes(
                                        platform
                                      )}
                                      onChange={() =>
                                        handlePlatformToggle(platform)
                                      }
                                    />
                                    <Label
                                      htmlFor={`${platform}-mobile`}
                                      className="text-sm font-medium cursor-pointer flex-1"
                                    >
                                      {platform}
                                    </Label>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {
                                        problems.filter(
                                          (p) => p.Platform === platform
                                        ).length
                                      }
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* View Options */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            View Options
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/80">
                            <div className="flex items-center gap-3">
                              <Tag className="h-4 w-4 text-blue-600" />
                              <Label
                                htmlFor="show-tags-mobile"
                                className="font-medium"
                              >
                                Show Tags
                              </Label>
                            </div>
                            <Switch
                              id="show-tags-mobile"
                              checked={showTags}
                              onCheckedChange={setShowTags}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/80">
                            <div className="flex items-center gap-3">
                              <EyeOff className="h-4 w-4 text-orange-600" />
                              <Label
                                htmlFor="hide-solved-mobile"
                                className="font-medium"
                              >
                                Hide Solved
                              </Label>
                            </div>
                            <Switch
                              id="hide-solved-mobile"
                              checked={hideSolved}
                              onCheckedChange={setHideSolved}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/80">
                            <div className="flex items-center gap-3">
                              <Bookmark className="h-4 w-4 text-yellow-600" />
                              <Label
                                htmlFor="bookmarked-only-mobile"
                                className="font-medium"
                              >
                                Bookmarked Only
                              </Label>
                            </div>
                            <Switch
                              id="bookmarked-only-mobile"
                              checked={showBookmarkedOnly}
                              onCheckedChange={setShowBookmarkedOnly}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <Button
                        variant="outline"
                        className="w-full h-11 gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 dark:bg-red-950/50 dark:hover:bg-red-950/80 dark:text-red-400 dark:border-red-800"
                        onClick={resetFilters}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset All Filters
                      </Button>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                      <div className="flex items-center justify-between gap-6">
                        {/* Filter Controls */}
                        <div className="flex items-center gap-3 flex-1">
                          {/* Topics */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="hover:cursor-pointer h-10 px-4 gap-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                              >
                                <Tag className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Topics</span>
                                {selectedTopics.length > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-700 text-xs ml-1"
                                  >
                                    {selectedTopics.length}
                                  </Badge>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-96 max-h-80 overflow-y-auto"
                            >
                              <div className="p-4">
                                <div className="flex flex-wrap gap-2">
                                  {topics.map((topic) => (
                                    <Badge
                                      key={topic}
                                      variant={
                                        selectedTopics.includes(topic)
                                          ? "default"
                                          : "outline"
                                      }
                                      className={`cursor-pointer py-2 px-3 transition-all duration-200 ${
                                        selectedTopics.includes(topic)
                                          ? "bg-blue-600 text-white hover:bg-blue-700"
                                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                                      }`}
                                      onClick={() => handleTopicToggle(topic)}
                                    >
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Difficulty */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="hover:cursor-pointer h-10 px-4 gap-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                              >
                                <SlidersHorizontal className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Difficulty</span>
                                {selectedDifficulties.length < 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-700 text-xs ml-1"
                                  >
                                    {selectedDifficulties.length}
                                  </Badge>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                              <div className="p-4 space-y-3">
                                {["Easy", "Medium", "Hard"].map(
                                  (difficulty) => (
                                    <div
                                      key={difficulty}
                                      className="flex items-center space-x-3"
                                    >
                                      <input
                                        type="checkbox"
                                        id={difficulty}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedDifficulties.includes(
                                          difficulty
                                        )}
                                        onChange={() =>
                                          handleDifficultyToggle(difficulty)
                                        }
                                      />
                                      <Label
                                        htmlFor={difficulty}
                                        className="text-sm font-medium cursor-pointer flex-1"
                                      >
                                        {difficulty}
                                      </Label>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getDifficultyBadge(
                                          difficulty
                                        )}`}
                                      >
                                        {
                                          problems.filter(
                                            (p) => p.Difficulty === difficulty
                                          ).length
                                        }
                                      </Badge>
                                    </div>
                                  )
                                )}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Platform */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="hover:cursor-pointer h-10 px-4 gap-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                              >
                                <Building2 className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">Platform</span>
                                {selectedPlatforms.length < 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-700 text-xs ml-1"
                                  >
                                    {selectedPlatforms.length}
                                  </Badge>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                              <div className="p-4 space-y-3">
                                {[
                                  "LeetCode",
                                  "GeeksForGeeks",
                                  "Coding Ninjas",
                                ].map((platform) => (
                                  <div
                                    key={platform}
                                    className="flex items-center space-x-3"
                                  >
                                    <input
                                      type="checkbox"
                                      id={platform}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      checked={selectedPlatforms.includes(
                                        platform
                                      )}
                                      onChange={() =>
                                        handlePlatformToggle(platform)
                                      }
                                    />
                                    <Label
                                      htmlFor={platform}
                                      className="text-sm font-medium cursor-pointer flex-1"
                                    >
                                      {platform}
                                    </Label>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {
                                        problems.filter(
                                          (p) => p.Platform === platform
                                        ).length
                                      }
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* View Options */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              className="hover:cursor-pointer "
                              id="show-tags"
                              checked={showTags}
                              onCheckedChange={setShowTags}
                            />
                            <Label
                              htmlFor="show-tags"
                              className="text-sm font-medium"
                            >
                              Show Tags
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              className="hover:cursor-pointer "
                              id="hide-solved"
                              checked={hideSolved}
                              onCheckedChange={setHideSolved}
                            />
                            <Label
                              htmlFor="hide-solved"
                              className="text-sm font-medium"
                            >
                              Hide Solved
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              className="hover:cursor-pointer "
                              id="bookmarked-only"
                              checked={showBookmarkedOnly}
                              onCheckedChange={setShowBookmarkedOnly}
                            />
                            <Label
                              htmlFor="bookmarked-only"
                              className="text-sm font-medium"
                            >
                              Bookmarked Only
                            </Label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:cursor-pointer gap-2 h-10 bg-red-50 hover:bg-red-100 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                            onClick={resetFilters}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Search Bar */}
              <div className="relative order-3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /> */}
                <Input
                  className="pl-12 h-12 text-base bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 focus:shadow-lg focus:border-blue-300 dark:bg-gray-900/80 dark:border-gray-700/60"
                  placeholder="Search problems by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Problem Cards */}
            <div className="grid gap-6">
              {topics
                .filter(
                  (topic) =>
                    selectedTopics.length === 0 ||
                    selectedTopics.includes(topic)
                )
                .map((topic) => {
                  const topicProblems = filteredProblems.filter(
                    (problem) => problem.Topic === topic
                  );
                const solved = filteredProblems.filter(
                    (problem) => problem.Topic === topic && problem["Solved Status"] === 1
                ).length;
                  return topicProblems.length > 0 ? (
                    <Card key={topic}>
                      <CardHeader className="py-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {topic}
                          <Badge
                            variant="secondary"
                            className="ml-2 font-normal"
                          >
                              {solved} / {topicProblems.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            {/* Desktop Table View */}
                            <table className="w-full border-collapse hidden md:table">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Question
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[120px]">
                                    Difficulty
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[100px] text-center">
                                    Companies
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[80px] text-center">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[80px] text-center">
                                    Save
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[80px] text-center">
                                    Notes
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {topicProblems.map((problem, index) => (
                                  <tr
                                    key={index}
                                    className={`transition-colors ${
                                      solvedProblems.has(
                                        problem["Problem Name"]
                                      )
                                        ? "bg-green-50/70 hover:bg-green-100/80 dark:bg-green-950/30 dark:hover:bg-green-900/40"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    }`}
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <a
                                            href={problem.Link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                          >
                                            {problem["Problem Name"]}
                                          </a>
                                          <Badge
                                            variant="outline"
                                            className="font-normal text-xs text-gray-500 border-gray-300 rounded-md"
                                          >
                                            {problem.Platform}
                                          </Badge>
                                        </div>
                                        {showTags && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {problem.Tags.map(
                                              (tag, tagIndex) => (
                                                <Badge
                                                  key={tagIndex}
                                                  variant="secondary"
                                                  className="font-normal text-xs"
                                                >
                                                  {tag}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge
                                        variant="outline"
                                        className={getDifficultyBadge(
                                          problem.Difficulty
                                        )}
                                      >
                                        {problem.Difficulty}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-3">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                              >
                                                <Building2 className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              style={{
                                                backgroundColor: "#ffffff",
                                                color: "#000000",
                                                padding: "0.5rem",
                                                borderRadius: "0.375rem",
                                                boxShadow:
                                                  "0 2px 10px rgba(0, 0, 0, 0.1)",
                                              }}
                                            >
                                              <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                {problem.Companies.length >
                                                0 ? (
                                                  problem.Companies.map(
                                                    (company, companyIndex) => (
                                                      <Badge
                                                        key={companyIndex}
                                                        variant="outline"
                                                        className="font-normal text-xs text-black-500 border-black-500"
                                                      >
                                                        {company}
                                                      </Badge>
                                                    )
                                                  )
                                                ) : (
                                                  <span className="text-xs text-grey-500">
                                                    No Data Available
                                                  </span>
                                                )}
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${
                                          solvedProblems.has(
                                            problem["Problem Name"]
                                          )
                                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                                        }`}
                                        onClick={() =>
                                          toggleSolvedStatus(
                                            problem["Problem Name"]
                                          )
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 ${
                                                  bookmarkedProblems.has(
                                                    problem["Problem Name"]
                                                  )
                                                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                }`}
                                                onClick={() =>
                                                  toggleBookmark(
                                                    problem["Problem Name"]
                                                  )
                                                }
                                              >
                                                <BookmarkIcon
                                                  className={`h-4 w-4 transition-colors ${
                                                    bookmarkedProblems.has(
                                                      problem["Problem Name"]
                                                    )
                                                      ? "fill-blue-600"
                                                      : ""
                                                  }`}
                                                />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                {bookmarkedProblems.has(
                                                  problem["Problem Name"]
                                                )
                                                  ? "Remove bookmark"
                                                  : "Add bookmark"}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${
                                          notesMap.has(problem["Problem Name"])
                                            ? "text-blue-600 hover:text-purple-700 hover:bg-purple-50"
                                            : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                        }`}
                                        onClick={() =>
                                          openNotesDialog(
                                            problem["Problem Name"]
                                          )
                                        }
                                      >
                                        <FileEdit className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Mobile Card View - Improved Layout */}
                            <div className="md:hidden divide-y">
                              {topicProblems.map((problem, index) => (
                                <div
                                  key={index}
                                  className={`p-3 ${
                                    solvedProblems.has(problem["Problem Name"])
                                      ? "bg-green-50/70 dark:bg-green-950/30"
                                      : ""
                                  }`}
                                >
                                  <div className="flex flex-col gap-2">
                                    {/* Header: Problem Title and Difficulty */}
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 pr-2">
                                        <a
                                          href={problem.Link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                          <span className="line-clamp-2">
                                            {problem["Problem Name"]}
                                          </span>
                                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        </a>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`${getDifficultyBadge(
                                          problem.Difficulty
                                        )} flex-shrink-0`}
                                      >
                                        {problem.Difficulty}
                                      </Badge>
                                    </div>

                                    {/* Metadata Row: Platform, Companies and Action Buttons */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                          variant="outline"
                                          className="font-normal text-xs text-gray-500 border-gray-300 rounded-md"
                                        >
                                          {problem.Platform}
                                        </Badge>
                                        {problem.Companies.length > 0 && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Badge
                                                  variant="outline"
                                                  className="font-normal text-xs text-gray-500 border-gray-300 flex items-center gap-1 cursor-pointer"
                                                >
                                                  <Building2 className="h-3 w-3" />
                                                  {problem.Companies.length}
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent
                                                style={{
                                                  backgroundColor: "#ffffff",
                                                  color: "#000000",
                                                  padding: "0.5rem",
                                                  borderRadius: "0.375rem",
                                                  boxShadow:
                                                    "0 2px 10px rgba(0, 0, 0, 0.1)",
                                                }}
                                              >
                                                <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                  {problem.Companies.map(
                                                    (company, companyIndex) => (
                                                      <Badge
                                                        key={companyIndex}
                                                        variant="outline"
                                                        className="font-normal text-xs text-black-500 border-black-500"
                                                      >
                                                        {company}
                                                      </Badge>
                                                    )
                                                  )}
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        {notesMap.has(
                                          problem["Problem Name"]
                                        ) && (
                                          <Badge
                                            variant="outline"
                                            className="text-blue-600 border-blue-200 text-xs"
                                          >
                                            Has Notes
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Action Buttons - Now aligned to the right on the same row */}
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 w-8 p-0 ${
                                            solvedProblems.has(
                                              problem["Problem Name"]
                                            )
                                              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                                          }`}
                                          onClick={() =>
                                            toggleSolvedStatus(
                                              problem["Problem Name"]
                                            )
                                          }
                                          aria-label="Mark as solved"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 w-8 p-0 ${
                                            bookmarkedProblems.has(
                                              problem["Problem Name"]
                                            )
                                              ? "text-blue-500"
                                              : "text-gray-400 hover:text-gray-600"
                                          }`}
                                          onClick={() =>
                                            toggleBookmark(
                                              problem["Problem Name"]
                                            )
                                          }
                                          aria-label="Bookmark problem"
                                        >
                                          <BookmarkIcon
                                            className={`h-4 w-4 transition-colors ${
                                              bookmarkedProblems.has(
                                                problem["Problem Name"]
                                              )
                                                ? "fill-blue-500"
                                                : ""
                                            }`}
                                          />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 w-8 p-0 ${
                                            notesMap.has(
                                              problem["Problem Name"]
                                            )
                                              ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                              : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                          }`}
                                          onClick={() =>
                                            openNotesDialog(
                                              problem["Problem Name"]
                                            )
                                          }
                                          aria-label="Add or edit notes"
                                        >
                                          <FileEdit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Tags */}
                                    {showTags && problem.Tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {problem.Tags.map((tag, tagIndex) => (
                                          <Badge
                                            key={tagIndex}
                                            variant="secondary"
                                            className="font-normal text-xs"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null;
                })}
            </div>
          </div>
        </main>

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
                    href="https://github.com/maskedsyntax"
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
            </div>
          </div>
        </footer>

        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="sm:max-w-[425px] w-[95%] max-w-[95%] sm:w-auto">
            <DialogHeader>
              <DialogTitle className="pr-8">
                Notes for {currentProblemForNotes}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Add your notes here..."
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNotesDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={saveNotes} className="w-full sm:w-auto">
                Save Notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
