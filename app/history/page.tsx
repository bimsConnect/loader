import { Header } from "@/components/header"
import { HistoryList } from "@/components/history/history-list"

export default function HistoryPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <HistoryList />
        </div>
      </main>
    </>
  )
}
