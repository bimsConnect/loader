"use client"

import { useState } from "react"
import { LogOut, Menu, User, History, FileText, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 pt-4">
                <Link href="/loader-request" passHref>
                  <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Permintaan Loader
                  </Button>
                </Link>
                <Link href="/history" passHref>
                  <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                    <History className="mr-2 h-4 w-4" />
                    Riwayat
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start text-red-500"
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/loader-request" className="font-semibold text-lg text-blue-600">
            Loader Request System
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/loader-request" passHref>
            <Button
              variant="ghost"
              className={`text-gray-700 ${isActive("/loader-request") ? "bg-blue-50 text-blue-700" : ""}`}
            >
              <FileText className="mr-2 h-4 w-4" />
              Permintaan Loader
            </Button>
          </Link>
          <Link href="/history" passHref>
            <Button
              variant="ghost"
              className={`text-gray-700 ${isActive("/history") ? "bg-blue-50 text-blue-700" : ""}`}
            >
              <History className="mr-2 h-4 w-4" />
              Riwayat
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.name || "User"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
