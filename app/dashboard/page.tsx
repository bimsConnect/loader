import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, FileText, Truck, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Hari ini:{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Permintaan</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1">24</h3>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      12%
                    </span>
                    <span className="text-gray-500 ml-2">dari bulan lalu</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Inbound</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1">14</h3>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      8%
                    </span>
                    <span className="text-gray-500 ml-2">dari bulan lalu</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Outbound</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1">10</h3>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      5%
                    </span>
                    <span className="text-gray-500 ml-2">dari bulan lalu</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hari Ini</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1">3</h3>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-red-500 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      2%
                    </span>
                    <span className="text-gray-500 ml-2">dari kemarin</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Aktivitas Permintaan Loader</CardTitle>
                    <CardDescription>Jumlah permintaan loader dalam 7 hari terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart2 className="h-12 w-12 text-blue-300 mx-auto mb-2" />
                        <p className="text-gray-500">Grafik aktivitas permintaan loader</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Status Permintaan</CardTitle>
                    <CardDescription>Permintaan loader terbaru</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">PT. Maju Bersama</p>
                          <p className="text-sm text-gray-500">Inbound • B 1234 CD</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Selesai</span>
                          <p className="text-xs text-gray-500 mt-1">10:30</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">PT. Sukses Makmur</p>
                          <p className="text-sm text-gray-500">Outbound • B 5678 EF</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Proses</span>
                          <p className="text-xs text-gray-500 mt-1">09:15</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">PT. Jaya Abadi</p>
                          <p className="text-sm text-gray-500">Inbound • B 9012 GH</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Tertunda</span>
                          <p className="text-xs text-gray-500 mt-1">08:45</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">PT. Mitra Sejati</p>
                          <p className="text-sm text-gray-500">Outbound • B 3456 IJ</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Selesai</span>
                          <p className="text-xs text-gray-500 mt-1">Kemarin</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
