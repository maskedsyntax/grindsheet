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
} from "lucide-react";
import { useState, useEffect } from "react";

interface Problem {
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
  id: number; // Added to store problem_id from gsheet_data.json
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

interface GrindSheetProps {
  onLogout: () => void;
}

export function GrindSheet({ onLogout }: GrindSheetProps) {
  const [showTags, setShowTags] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([
    "Easy",
    "Medium",
    "Hard",
  ]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "LeetCode",
    "HackerRank",
    "CodeChef",
    "Codeforces",
    "GeeksForGeeks",
    "Coding Ninjas",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Set<string>>(
    new Set()
  );
  const [hideSolved, setHideSolved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notes related state
  const [notesMap, setNotesMap] = useState<Map<string, string>>(new Map());
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentProblemForNotes, setCurrentProblemForNotes] =
    useState<string>("");
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [problemIdMap, setProblemIdMap] = useState<Map<string, number>>(
    new Map()
  ); // Map problem name to problem_id

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
        "http://localhost:8000/user-problems",
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
        `http://localhost:8000/user-problems/${problemId}`,
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
    return (
      topicMatch &&
      difficultyMatch &&
      platformMatch &&
      searchMatch &&
      solvedMatch
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
          <p className="mb-6">{error || "Please try again later."}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4 mt-4">
            {error}
          </div>
        )}
        <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-10">
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
                className="font-normal bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
              >
                <GraduationCap className="h-3 w-3 mr-1" />
                Closed Beta Release · v1.0.0-beta
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
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
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <div className="md:hidden p-4 border-t">
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

        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Tag className="h-4 w-4" />
                        Topics
                        {selectedTopics.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 px-1.5 text-xs"
                          >
                            {selectedTopics.length}
                          </Badge>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[280px] md:w-96 max-h-80 overflow-y-auto"
                    >
                      <div className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {topics.map((topic) => (
                            <Badge
                              key={topic}
                              variant={
                                selectedTopics.includes(topic)
                                  ? "secondary"
                                  : "outline"
                              }
                              className={`cursor-pointer py-1.5 px-3 ${
                                selectedTopics.includes(topic)
                                  ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FilterIcon className="h-4 w-4" />
                        Difficulty
                        {selectedDifficulties.length < 3 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 px-1.5 text-xs"
                          >
                            {selectedDifficulties.length}
                          </Badge>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <div className="p-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="easy"
                            className="rounded"
                            checked={selectedDifficulties.includes("Easy")}
                            onChange={() => handleDifficultyToggle("Easy")}
                          />
                          <Label
                            htmlFor="easy"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Easy
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="medium"
                            className="rounded"
                            checked={selectedDifficulties.includes("Medium")}
                            onChange={() => handleDifficultyToggle("Medium")}
                          />
                          <Label
                            htmlFor="medium"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Medium
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hard"
                            className="rounded"
                            checked={selectedDifficulties.includes("Hard")}
                            onChange={() => handleDifficultyToggle("Hard")}
                          />
                          <Label
                            htmlFor="hard"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Hard
                          </Label>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <SlidersHorizontal className="h-4 w-4" />
                        Platform
                        {selectedPlatforms.length < 6 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 px-1.5 text-xs"
                          >
                            {selectedPlatforms.length}
                          </Badge>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <div className="p-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="leetcode"
                            className="rounded"
                            checked={selectedPlatforms.includes("LeetCode")}
                            onChange={() => handlePlatformToggle("LeetCode")}
                          />
                          <Label
                            htmlFor="leetcode"
                            className="text-sm font-normal cursor-pointer"
                          >
                            LeetCode
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hackerrank"
                            className="rounded"
                            checked={selectedPlatforms.includes("HackerRank")}
                            onChange={() => handlePlatformToggle("HackerRank")}
                          />
                          <Label
                            htmlFor="hackerrank"
                            className="text-sm font-normal cursor-pointer"
                          >
                            HackerRank
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="codechef"
                            className="rounded"
                            checked={selectedPlatforms.includes("CodeChef")}
                            onChange={() => handlePlatformToggle("CodeChef")}
                          />
                          <Label
                            htmlFor="codechef"
                            className="text-sm font-normal cursor-pointer"
                          >
                            CodeChef
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="codeforces"
                            className="rounded"
                            checked={selectedPlatforms.includes("Codeforces")}
                            onChange={() => handlePlatformToggle("Codeforces")}
                          />
                          <Label
                            htmlFor="codeforces"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Codeforces
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="geeksforgeeks"
                            className="rounded"
                            checked={selectedPlatforms.includes(
                              "GeeksForGeeks"
                            )}
                            onChange={() =>
                              handlePlatformToggle("GeeksForGeeks")
                            }
                          />
                          <Label
                            htmlFor="geeksforgeeks"
                            className="text-sm font-normal cursor-pointer"
                          >
                            GeeksForGeeks
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="coding-ninjas"
                            className="rounded"
                            checked={selectedPlatforms.includes(
                              "Coding Ninjas"
                            )}
                            onChange={() =>
                              handlePlatformToggle("Coding Ninjas")
                            }
                          />
                          <Label
                            htmlFor="coding-ninjas"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Coding Ninjas
                          </Label>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-tags"
                      checked={showTags}
                      onCheckedChange={setShowTags}
                    />
                    <Label htmlFor="show-tags" className="text-sm">
                      Show Tags
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="solved-filter"
                      checked={hideSolved}
                      onCheckedChange={setHideSolved}
                    />
                    <Label htmlFor="solved-filter" className="text-sm">
                      Hide Solved
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSelectedTopics([]);
                      setSelectedDifficulties(["Easy", "Medium", "Hard"]);
                      setSelectedPlatforms([
                        "LeetCode",
                        "HackerRank",
                        "CodeChef",
                        "Codeforces",
                        "GeeksForGeeks",
                        "Coding Ninjas",
                      ]);
                      setSearchQuery("");
                      setHideSolved(false);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

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
                  return topicProblems.length > 0 ? (
                    <Card key={topic}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {topic}
                          <Badge
                            variant="secondary"
                            className="ml-2 font-normal"
                          >
                            {topicProblems.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Question
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[120px]">
                                    Difficulty
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[100px] text-center hidden md:table-cell">
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
                                            className="font-normal text-xs text-gray-500 border-gray-300"
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
                                    <td className="px-4 py-3 text-center hidden md:table-cell">
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
                                            ? "text-green-600 hover:text-green-700"
                                            : "text-gray-400 hover:text-gray-600"
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
                                                className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950"
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
                                                      ? "text-blue-500 fill-blue-500"
                                                      : "text-gray-600 hover:text-blue-500"
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
                                            ? "text-blue-600 hover:text-blue-700"
                                            : "text-gray-400 hover:text-gray-600"
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null;
                })}
            </div>
          </div>
        </main>

        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Notes for {currentProblemForNotes}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Add your notes here..."
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNotesDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveNotes}>Save Notes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
