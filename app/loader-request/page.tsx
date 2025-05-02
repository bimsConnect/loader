import LoaderRequestForm from "@/components/loader-request-form"
import { Header } from "@/components/header"

export default function LoaderRequestPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <LoaderRequestForm />
        </div>
      </main>
    </>
  )
}
