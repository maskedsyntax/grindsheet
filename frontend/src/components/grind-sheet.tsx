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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Notes related state
  const [notesMap, setNotesMap] = useState<Map<string, string>>(new Map());
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentProblemForNotes, setCurrentProblemForNotes] =
    useState<string>("");
  const [currentNoteText, setCurrentNoteText] = useState("");

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
    const fetchData = async () => {
      try {
        // Fetch the JSON data from the public directory
        const response = await fetch("/assets/data/gsheet_data.json");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        processProblems(data);
      } catch (error) {
        console.error("Error loading problem data:", error);
        // Don't use fallback data, show error state instead
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openNotesDialog = (problemName: string) => {
    setCurrentProblemForNotes(problemName);
    setCurrentNoteText(notesMap.get(problemName) || "");
    setIsNotesDialogOpen(true);
  };

  const saveNotes = () => {
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

  const toggleSolvedStatus = (problemName: string) => {
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

  const toggleBookmark = (problemName: string) => {
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
    setMobileFiltersOpen(false);
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
            There was an error loading the problem data. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {/* Header */}
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

        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="grid gap-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Filter Toggle */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  <FilterIcon className="h-4 w-4" />
                  Filters
                  {(selectedTopics.length > 0 ||
                    selectedDifficulties.length < 3 ||
                    selectedPlatforms.length < 6) && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTopics.length +
                        (3 - selectedDifficulties.length) +
                        (6 - selectedPlatforms.length)}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Desktop Filters */}
              <div
                className={`bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm ${
                  mobileFiltersOpen ? "block" : "hidden md:block"
                }`}
              >
                {/* Mobile Filters Layout */}
                <div className="md:hidden">
                  {/* Filter Buttons Row */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            Topics
                          </div>
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
                        className="w-[280px] max-h-80 overflow-y-auto"
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-1">
                            <FilterIcon className="h-4 w-4" />
                            Difficulty
                          </div>
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
                              id="easy-mobile"
                              className="rounded"
                              checked={selectedDifficulties.includes("Easy")}
                              onChange={() => handleDifficultyToggle("Easy")}
                            />
                            <Label
                              htmlFor="easy-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              Easy
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="medium-mobile"
                              className="rounded"
                              checked={selectedDifficulties.includes("Medium")}
                              onChange={() => handleDifficultyToggle("Medium")}
                            />
                            <Label
                              htmlFor="medium-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              Medium
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="hard-mobile"
                              className="rounded"
                              checked={selectedDifficulties.includes("Hard")}
                              onChange={() => handleDifficultyToggle("Hard")}
                            />
                            <Label
                              htmlFor="hard-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              Hard
                            </Label>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-1">
                            <SlidersHorizontal className="h-4 w-4" />
                            Platform
                          </div>
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
                              id="leetcode-mobile"
                              className="rounded"
                              checked={selectedPlatforms.includes("LeetCode")}
                              onChange={() => handlePlatformToggle("LeetCode")}
                            />
                            <Label
                              htmlFor="leetcode-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              LeetCode
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="hackerrank-mobile"
                              className="rounded"
                              checked={selectedPlatforms.includes("HackerRank")}
                              onChange={() =>
                                handlePlatformToggle("HackerRank")
                              }
                            />
                            <Label
                              htmlFor="hackerrank-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              HackerRank
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="codechef-mobile"
                              className="rounded"
                              checked={selectedPlatforms.includes("CodeChef")}
                              onChange={() => handlePlatformToggle("CodeChef")}
                            />
                            <Label
                              htmlFor="codechef-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              CodeChef
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="codeforces-mobile"
                              className="rounded"
                              checked={selectedPlatforms.includes("Codeforces")}
                              onChange={() =>
                                handlePlatformToggle("Codeforces")
                              }
                            />
                            <Label
                              htmlFor="codeforces-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              Codeforces
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="geeksforgeeks-mobile"
                              className="rounded"
                              checked={selectedPlatforms.includes(
                                "GeeksForGeeks"
                              )}
                              onChange={() =>
                                handlePlatformToggle("GeeksForGeeks")
                              }
                            />
                            <Label
                              htmlFor="geeksforgeeks-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              GeeksForGeeks
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="coding-ninjas-mobile"
                              className="rounded"
                              checked={selectedPlatforms.includes(
                                "Coding Ninjas"
                              )}
                              onChange={() =>
                                handlePlatformToggle("Coding Ninjas")
                              }
                            />
                            <Label
                              htmlFor="coding-ninjas-mobile"
                              className="text-sm font-normal cursor-pointer"
                            >
                              Coding Ninjas
                            </Label>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Toggle Controls Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="show-tags-mobile"
                        checked={showTags}
                        onCheckedChange={setShowTags}
                      />
                      <Label htmlFor="show-tags-mobile" className="text-sm">
                        Show Tags
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="solved-filter-mobile"
                        checked={hideSolved}
                        onCheckedChange={setHideSolved}
                      />
                      <Label htmlFor="solved-filter-mobile" className="text-sm">
                        Hide Solved
                      </Label>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 justify-center"
                    onClick={resetFilters}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {/* Desktop Filters Layout */}
                <div className="hidden md:flex md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 h-10 px-4"
                        >
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 h-10 px-4"
                        >
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 h-10 px-4"
                        >
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
                              onChange={() =>
                                handlePlatformToggle("HackerRank")
                              }
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
                              onChange={() =>
                                handlePlatformToggle("Codeforces")
                              }
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

                  {/* Toggle Controls */}
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
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
                      className="gap-1 h-10"
                      onClick={resetFilters}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
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
                  return topicProblems.length > 0 ? (
                    <Card key={topic}>
                      <CardHeader className="py-0">
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
                                                  <span className="text-xs text-grey-500"></span>
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
                                          className="font-normal text-xs text-gray-500 border-gray-300"
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
                                              ? "text-green-600 hover:text-green-700"
                                              : "text-gray-400 hover:text-gray-600"
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
                                              ? "text-blue-600 hover:text-blue-700"
                                              : "text-gray-400 hover:text-gray-600"
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
                  Made with <span className="text-red-500 mx-1">♥</span> by
                  Aftaab Siddiqui
                </span>
                <span className="hidden md:inline mx-2">•</span>
                <span>Designed by Shifa Siddiqui</span>
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
