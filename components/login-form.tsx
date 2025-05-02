"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"

export default function LoginForm() {
  const { login, register, loading: authLoading } = useAuth()
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  // Login state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Register state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const isLoginFormValid = username.trim() !== "" && password.trim() !== ""
  const isRegisterFormValid =
    registerName.trim() !== "" &&
    registerEmail.trim() !== "" &&
    registerPassword.trim() !== "" &&
    registerConfirmPassword.trim() !== "" &&
    registerPassword === registerConfirmPassword

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(username, password)

      if (!result.success) {
        setError(result.error || "Username atau password salah. Silakan coba lagi.")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterError("")
    setRegisterSuccess(false)

    // Validate passwords match
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Password tidak cocok. Silakan periksa kembali.")
      setRegisterLoading(false)
      return
    }

    try {
      const result = await register(registerName, registerEmail, registerPassword)

      if (!result.success) {
        setRegisterError(result.error || "Registrasi gagal. Silakan coba lagi.")
      } else {
        setRegisterSuccess(true)

        // Reset form
        setRegisterName("")
        setRegisterEmail("")
        setRegisterPassword("")
        setRegisterConfirmPassword("")
      }
    } catch (err) {
      setRegisterError("Terjadi kesalahan saat registrasi. Silakan coba lagi.")
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="space-y-4 items-center text-center bg-gradient-to-b from-gray-50 to-white rounded-t-lg">
        <div className="w-32 h-32 relative mx-auto">
          <Image
            src="/images/company/logo.png?height=128&width=128"
            alt="Company Logo"
            width={128}
            height={128}
            className="object-contain"
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Loader Request</CardTitle>
        <CardDescription className="text-gray-600">Sistem Manajemen Permintaan Loader</CardDescription>
      </CardHeader>

      {!showRegisterForm ? (
        <>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Email / Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan email atau username"
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                disabled={!isLoginFormValid || loading || authLoading}
              >
                {loading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6 text-sm text-gray-500">
            <p>
              Belum punya akun?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-green-600 hover:text-green-700"
                onClick={() => setShowRegisterForm(true)}
              >
                Daftar sekarang
              </Button>
            </p>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {registerError && (
                <Alert variant="destructive">
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
              {registerSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>Registrasi berhasil! Silakan login dengan akun baru Anda.</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="registerName">Nama Lengkap</Label>
                <Input
                  id="registerName"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Masukkan email"
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="registerPassword"
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerConfirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="registerConfirmPassword"
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password"
                    required
                    className="border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  >
                    {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                disabled={!isRegisterFormValid || registerLoading || authLoading}
              >
                {registerLoading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Daftar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6 text-sm text-gray-500">
            <p>
              Sudah punya akun?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-green-600 hover:text-green-700"
                onClick={() => setShowRegisterForm(false)}
              >
                Login sekarang
              </Button>
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
