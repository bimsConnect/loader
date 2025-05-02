"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FormTab {
  id: string
  title: string
  active: boolean
}

interface FormTabSystemProps {
  children: React.ReactNode
  onTabChange: (tabId: string) => void
  onNewTab: () => void
}

export function FormTabSystem({ children, onTabChange, onNewTab }: FormTabSystemProps) {
  const [tabs, setTabs] = useState<FormTab[]>([
    {
      id: "tab-1",
      title: "Form Permintaan Loader #1",
      active: true,
    },
  ])

  // Keep track of the next tab number to avoid duplicate keys
  const [nextTabNumber, setNextTabNumber] = useState(2)

  const addNewTab = () => {
    const newTabId = `tab-${nextTabNumber}`
    const newTab: FormTab = {
      id: newTabId,
      title: `Form Permintaan Loader #${nextTabNumber}`,
      active: false,
    }

    setTabs(
      tabs
        .map((tab) => ({
          ...tab,
          active: false,
        }))
        .concat(newTab),
    )

    // Increment the next tab number
    setNextTabNumber((prevNumber) => prevNumber + 1)

    // Set the new tab as active
    setTimeout(() => {
      setTabs((currentTabs) =>
        currentTabs.map((tab) => ({
          ...tab,
          active: tab.id === newTabId,
        })),
      )

      // Call the onNewTab callback to create new form data for this tab
      onNewTab()
    }, 100)
  }

  const activateTab = (tabId: string) => {
    setTabs(
      tabs.map((tab) => ({
        ...tab,
        active: tab.id === tabId,
      })),
    )

    // Call the onTabChange callback to switch to the form data for this tab
    onTabChange(tabId)
  }

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // Don't allow closing the last tab
    if (tabs.length === 1) return

    const tabIndex = tabs.findIndex((tab) => tab.id === tabId)
    const isActiveTab = tabs[tabIndex].active

    const newTabs = tabs.filter((tab) => tab.id !== tabId)

    // If we're closing the active tab, activate another one
    if (isActiveTab && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
      newTabs[newActiveIndex].active = true

      // Call the onTabChange callback to switch to the form data for the new active tab
      setTimeout(() => {
        onTabChange(newTabs[newActiveIndex].id)
      }, 100)
    }

    setTabs(newTabs)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="form-tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`form-tab ${tab.active ? "active" : ""}`} onClick={() => activateTab(tab.id)}>
            <FileText size={16} className="mr-2 text-gray-500" />
            <span>{tab.title}</span>
            <button className="form-tab-close" onClick={(e) => closeTab(tab.id, e)} aria-label="Close tab">
              <X size={16} />
            </button>
          </div>
        ))}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="form-tab-add" onClick={addNewTab} aria-label="Add new tab">
                <Plus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tambah form baru</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-1 bg-white p-4">{children}</div>
    </div>
  )
}
