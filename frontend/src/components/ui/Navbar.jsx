import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { useSelector, useDispatch } from "react-redux"
import { setCart } from "../../redux/productSlice"
import { setUser } from "../../redux/userSlice"
import { Button } from "../ui/button"

const Navbar = () => {

  const { user } = useSelector((state) => state.user)
  const { cart } = useSelector((state) => state.product)
  const [loading, setLoading] = useState(true)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const accessToken = localStorage.getItem("accesstoken")
  const admin = user?.role === "admin"

  useEffect(() => {

    const loadInitialData = async () => {

      const userId = localStorage.getItem("userId")

      if (!accessToken || !userId) {
        setLoading(false)
        return
      }

      try {

        const [userRes, cartRes] = await Promise.all([

          axios.get(`${import.meta.env.VITE_URL}/api/v1/user/get-user/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),

          axios.get(`${import.meta.env.VITE_URL}/api/v1/cart`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })

        ])

        if (userRes.data.success) {
          dispatch(setUser(userRes.data.user))
        }

        if (cartRes.data.success) {
          dispatch(setCart(cartRes.data.cart))
        }

      } catch (e) {

        localStorage.clear()
        dispatch(setUser(null))

      } finally {

        setLoading(false)

      }

    }

    loadInitialData()

  }, [dispatch, accessToken])

  const logoutHandler = async () => {

    try {

      if (accessToken) {

        await axios.post(
          `${import.meta.env.VITE_URL}/api/v1/user/logout`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

      }

    } catch (e) { }

    finally {

      localStorage.clear()
      dispatch(setUser(null))
      dispatch(setCart({ items: [] }))
      toast.success("Logged out successfully")
      navigate("/login")

    }

  }

  const itemCount = cart?.items?.length || 0

  if (loading) {
    return <header className="h-[72px] w-full bg-[#fff7ed]" />
  }

  return (

    <header className="bg-[#fff7ed] fixed w-full z-50 border-b border-orange-100 shadow-sm">

      <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-6">

        <Link to="/">
          <img src="/allinonebazar.png" className="w-[120px]" />
        </Link>

        <nav className="flex items-center gap-10">

          <ul className="flex gap-8 text-[16px] font-semibold text-gray-700">

            <li>
              <Link to="/" className="hover:text-orange-600">Home</Link>
            </li>

            <li>
              <Link to="/products" className="hover:text-orange-600">Products</Link>
            </li>

            {user && (

              <li className="text-orange-700 font-bold">

                <Link to={`/profile/${user._id}`}>
                  Hello {user.firstName}
                </Link>

              </li>

            )}

            {admin && (

              <li>

                <Link to="/dashboard/sales" className="hover:text-orange-600">
                  Dashboard
                </Link>

              </li>

            )}

          </ul>

          <Link to="/cart" className="relative p-2">

            <ShoppingCart className="w-6 h-6" />

            {itemCount > 0 && (

              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {itemCount}
              </span>

            )}

          </Link>

          {user ? (

            <Button
              onClick={logoutHandler}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 px-6 rounded-md"
            >

              Logout

            </Button>

          ) : (

            <Link to="/login">

              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 px-8 rounded-md">

                Login

              </Button>

            </Link>

          )}

        </nav>
      </div>

    </header>

  )

}

export default Navbar




