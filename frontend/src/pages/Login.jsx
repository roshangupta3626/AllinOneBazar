import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/userSlice"

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })

  // const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axios.post("http://localhost:8000/api/v1/user/login", formData, { headers: { "Content-Type": "application/json" } })
      if (res.data.success) {
        // Store tokens and userId in localStorage
        localStorage.setItem('accesstoken', res.data.accesstoken)
        localStorage.setItem('refreshtoken', res.data.refreshtoken)
        localStorage.setItem('userId', res.data.userId)
        // toast.success(res.data.message); 
        navigate("/")
        dispatch(setUser(res.data.user))
        toast.success(res.data.message);
      }
    } catch (error) { toast.error(error?.response?.data?.message || "Login failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
          <CardDescription className="text-center">Enter email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input name="email" type="email" placeholder="enter email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <div className="relative">
                <Input name="password" placeholder="enter password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required />
                {showPassword ? <EyeOff onClick={() => setShowPassword(false)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" /> : <Eye onClick={() => setShowPassword(true)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2 inline" />Please wait</> : "Login"}
            </Button>
          </form>
        </CardContent>
        {/* <CardFooter className="justify-center">
          <p className="text-sm">Don't have account? <Link to="/signup" className="text-orange-600">Signup</Link></p>
        </CardFooter> */}
        <CardFooter className="flex flex-col gap-2">
          <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline">
            Forgot Password?
          </Link>

          <p className="text-sm">
            Don't have account?{" "}
            <Link to="/signup" className="text-orange-600">Signup</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
export default Login
