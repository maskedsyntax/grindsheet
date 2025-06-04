"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BookmarkIcon,
  Building2,
  CheckCircle,
  ChevronDown,
  FilterIcon,
  GraduationCap,
  Heart,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tag,
  FileEdit,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { JetBrains_Mono, Pacifico, Kalam, Ubuntu_Sans } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-montserrat",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-pacifico",
});

const ubuntu = Ubuntu_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-pacifico",
});

interface Problem {
  "Problem Name": string
  Topic: string
  Difficulty: string
  Platform: string
  Link: string
  Tags: string[]
  Companies: string[]
  "Solved Status": number
  "Needs Revision": boolean
  Notes: string
}

export default function Home() {
  const [showTags, setShowTags] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(["Easy", "Medium", "Hard"])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "LeetCode",
    "HackerRank",
    "CodeChef",
    "Codeforces",
    "GeeksForGeeks",
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set())
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Set<string>>(new Set())
  const [hideSolved, setHideSolved] = useState(false)

  // Notes related state
  const [notesMap, setNotesMap] = useState<Map<string, string>>(new Map())
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [currentProblemForNotes, setCurrentProblemForNotes] = useState<string>("")
  const [currentNoteText, setCurrentNoteText] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/assets/data/gsheet_data.json")
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        setProblems(data)

        // Extract unique topics
        const uniqueTopics = Array.from(new Set(data.map((problem: Problem) => problem.Topic))) as string[]
        setTopics(uniqueTopics)

        // Initialize solved problems from data
        const initialSolved = new Set<string>()
        data.forEach((problem: Problem) => {
          if (problem["Solved Status"] === 1) {
            initialSolved.add(problem["Problem Name"])
          }
        })
        setSolvedProblems(initialSolved)

        // Initialize notes from data
        const initialNotes = new Map<string, string>()
        data.forEach((problem: Problem) => {
          if (problem.Notes && problem.Notes.trim() !== "") {
            initialNotes.set(problem["Problem Name"], problem.Notes)
          }
        })
        setNotesMap(initialNotes)

        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        // Provide some sample data as fallback
        const fallbackData = [
          {
            "Problem Name": "Selection Sort",
            Topic: "Sorting",
            Difficulty: "Easy",
            Platform: "GeeksForGeeks",
            Link: "https://bit.ly/3ppA6YJ",
            Tags: ["Sorting", "Array"],
            Companies: ["Microsoft", "Medlife"],
            "Solved Status": 0,
            "Needs Revision": false,
            Notes: "",
          },
          {
            "Problem Name": "Bubble Sort",
            Topic: "Sorting",
            Difficulty: "Easy",
            Platform: "GeeksForGeeks",
            Link: "https://bit.ly/3w6yQx8",
            Tags: ["Sorting", "Array"],
            Companies: ["Microsoft", "Wipro", "SAP Labs"],
            "Solved Status": 0,
            "Needs Revision": false,
            Notes: "",
          },
        ]
        setProblems(fallbackData)
        setTopics(["Sorting"])
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const openNotesDialog = (problemName: string) => {
    setCurrentProblemForNotes(problemName)
    setCurrentNoteText(notesMap.get(problemName) || "")
    setIsNotesDialogOpen(true)
  }

  const saveNotes = () => {
    const newNotesMap = new Map(notesMap)
    if (currentNoteText.trim() === "") {
      newNotesMap.delete(currentProblemForNotes)
    } else {
      newNotesMap.set(currentProblemForNotes, currentNoteText)
    }
    setNotesMap(newNotesMap)
    setIsNotesDialogOpen(false)
  }

  const filteredProblems = problems.filter((problem) => {
    const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(problem.Topic)
    const difficultyMatch = selectedDifficulties.includes(problem.Difficulty)
    const platformMatch = selectedPlatforms.includes(problem.Platform)
    const searchMatch = searchQuery === "" || problem["Problem Name"].toLowerCase().includes(searchQuery.toLowerCase())
    const solvedMatch = !hideSolved || !solvedProblems.has(problem["Problem Name"])
    return topicMatch && difficultyMatch && platformMatch && searchMatch && solvedMatch
  })

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
      case "hard":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
    }
  }

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty],
    )
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const toggleSolvedStatus = (problemName: string) => {
    setSolvedProblems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(problemName)) {
        newSet.delete(problemName)
      } else {
        newSet.add(problemName)
      }
      return newSet
    })
  }

  const toggleBookmark = (problemName: string) => {
    setBookmarkedProblems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(problemName)) {
        newSet.delete(problemName)
      } else {
        newSet.add(problemName)
      }
      return newSet
    })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white dark:bg-white dark:text-black h-14 w-14 flex items-center justify-center rounded-lg font-bold text-xl">
              <img
              src="/assets/images/grindsheet-logo.png"
              alt="GrindSheet Logo"
              className="w-full h-full object-contain"
            />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${jetBrainsMono.className}`}>GrindSheet</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Solve. Track. Improve.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="font-normal bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Early Access · v0.9.0-beta
            </Badge>
            <Button size="sm" variant="outline">
              Log In
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
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
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Tag className="h-4 w-4" />
                      Topics
                      {selectedTopics.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {selectedTopics.length}
                        </Badge>
                      )}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-96 max-h-80 overflow-y-auto">
                    <div className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant={selectedTopics.includes(topic) ? "secondary" : "outline"}
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
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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
                        <Label htmlFor="easy" className="text-sm font-normal cursor-pointer">
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
                        <Label htmlFor="medium" className="text-sm font-normal cursor-pointer">
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
                        <Label htmlFor="hard" className="text-sm font-normal cursor-pointer">
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
                      {selectedPlatforms.length < 5 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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
                        <Label htmlFor="leetcode" className="text-sm font-normal cursor-pointer">
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
                        <Label htmlFor="hackerrank" className="text-sm font-normal cursor-pointer">
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
                        <Label htmlFor="codechef" className="text-sm font-normal cursor-pointer">
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
                        <Label htmlFor="codeforces" className="text-sm font-normal cursor-pointer">
                          Codeforces
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="geeksforgeeks"
                          className="rounded"
                          checked={selectedPlatforms.includes("GeeksForGeeks")}
                          onChange={() => handlePlatformToggle("GeeksForGeeks")}
                        />
                        <Label htmlFor="geeksforgeeks" className="text-sm font-normal cursor-pointer">
                          GeeksForGeeks
                        </Label>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="show-tags" checked={showTags} onCheckedChange={setShowTags} />
                  <Label htmlFor="show-tags" className="text-sm">
                    Show Tags
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="solved-filter" checked={hideSolved} onCheckedChange={setHideSolved} />
                  <Label htmlFor="solved-filter" className="text-sm">
                    Hide Solved
                  </Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setSelectedTopics([])
                    setSelectedDifficulties(["Easy", "Medium", "Hard"])
                    setSelectedPlatforms(["LeetCode", "HackerRank", "CodeChef", "Codeforces", "GeeksForGeeks"])
                    setSearchQuery("")
                    setHideSolved(false)
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
              .filter((topic) => selectedTopics.length === 0 || selectedTopics.includes(topic))
              .map((topic) => {
                const topicProblems = filteredProblems.filter((problem) => problem.Topic === topic)
                return topicProblems.length > 0 ? (
                  <Card key={topic}>
                    <CardHeader className="py-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {topic}
                        <Badge variant="secondary" className="ml-2 font-normal">
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
                                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[180px] text-center">
                                  Companies
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[80px] text-center">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-[120px] text-center">
                                  Bookmark
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
                                    solvedProblems.has(problem["Problem Name"])
                                      ? "bg-green-50/70 hover:bg-green-100/80 dark:bg-green-950/30 dark:hover:bg-green-900/40"
                                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
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
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {problem.Tags.map((tag, tagIndex) => (
                                            <Badge key={tagIndex} variant="secondary" className="font-normal text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline" className={getDifficultyBadge(problem.Difficulty)}>
                                      {problem.Difficulty}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                              <Building2 className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent
                                            style={{
                                              backgroundColor: "#ffffff",
                                              color: "#000000",
                                              padding: "0.5rem",
                                              borderRadius: "0.375rem",
                                              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                            }}
                                          >
                                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                                              {problem.Companies.map((company, companyIndex) => (
                                                <Badge
                                                  key={companyIndex}
                                                  variant="outline"
                                                  className="font-normal text-xs text-black-500 border-black-500"
                                                >
                                                  {company}
                                                </Badge>
                                              ))}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 rounded-full hover:bg-green-50 dark:hover:bg-green-950"
                                              onClick={() => toggleSolvedStatus(problem["Problem Name"])}
                                            >
                                              <CheckCircle
                                                className={`h-5 w-5 transition-colors ${
                                                  solvedProblems.has(problem["Problem Name"])
                                                    ? "text-green-600 stroke-[1.5px] dark:text-green-400"
                                                    : "text-gray-600 hover:text-green-500"
                                                }`}
                                              />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {solvedProblems.has(problem["Problem Name"])
                                                ? "Mark as unsolved"
                                                : "Mark as solved"}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
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
                                              onClick={() => toggleBookmark(problem["Problem Name"])}
                                            >
                                              <BookmarkIcon
                                                className={`h-4 w-4 transition-colors ${
                                                  bookmarkedProblems.has(problem["Problem Name"])
                                                    ? "text-blue-500 fill-blue-500"
                                                    : "text-gray-600 hover:text-blue-500"
                                                }`}
                                              />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {bookmarkedProblems.has(problem["Problem Name"])
                                                ? "Remove bookmark"
                                                : "Add bookmark"}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 hover:bg-purple-50 dark:hover:bg-purple-950"
                                              onClick={() => openNotesDialog(problem["Problem Name"])}
                                            >
                                              <FileEdit
                                                className={`h-4 w-4 transition-colors ${
                                                  notesMap.has(problem["Problem Name"])
                                                    ? "text-purple-500 fill-purple-100"
                                                    : "text-gray-600 hover:text-purple-500"
                                                }`}
                                              />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{notesMap.has(problem["Problem Name"]) ? "Edit notes" : "Add notes"}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              })
              .filter(Boolean)}
          </div>
        </div>
      </main>

      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {notesMap.has(currentProblemForNotes) ? "Edit Notes" : "Add Notes"} - {currentProblemForNotes}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Write your notes here..."
              className="min-h-[200px]"
              value={currentNoteText}
              onChange={(e) => setCurrentNoteText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} GrindSheet. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>by</span>
              <span className="font-medium">Aftaab Siddiqui</span>
              <span className="mx-1">•</span>
              <span>Designed by</span>
              <span className="font-medium">Shifa Siddiqui</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
