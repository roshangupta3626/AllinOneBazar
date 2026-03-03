import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { setProducts } from '@/redux/productSlice'

const AddProduct = () => {
  const accessToken = localStorage.getItem("accesstoken")
  const dispatch = useDispatch()
  const { products } = useSelector((state) => state.product) || { products: [] }
  
  const [loading, setLoading] = useState(false)
  const [productData, setProductData] = useState({
    productName: "",
    productPrice: "",
    productDesc: "",
    productImg: [],
    brand: "",
    category: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append("productName", productData.productName)
    formData.append("productPrice", productData.productPrice)
    formData.append("productDesc", productData.productDesc)
    formData.append("category", productData.category)
    formData.append("brand", productData.brand)

    if (productData.productImg.length === 0) {
      toast.error("Please select at least one image")
      setLoading(false)
      return
    }
    productData.productImg.forEach((img) => formData.append("files", img))

    try {
      const res = await axios.post(`${import.meta.env.VITE_URL}/api/v1/product/add`, formData, {
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "multipart/form-data" }
      })
      if (res.data.success) {
        dispatch(setProducts([...products, res.data.newProduct]))
        toast.success(res.data.message)
        setProductData({ productName: "", productPrice: "", productDesc: "", productImg: [], brand: "", category: "" })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4'>
      <Card className='max-w-4xl w-full shadow-lg border-orange-100'>
        <CardHeader className="py-3 border-b border-gray-50">
          <CardTitle className="text-xl font-bold text-orange-600">Add Product</CardTitle>
          <CardDescription className="text-xs">Fill details below to list your item</CardDescription>
        </CardHeader>
        
        <CardContent className="py-4 flex flex-col gap-4">
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-1.5'>
              <Label className="text-xs font-semibold text-gray-700">Product Name</Label>
              <Input name="productName" value={productData.productName} onChange={handleChange} placeholder="iPhone 15 Pro" className="h-9 text-sm focus-visible:ring-orange-500" required />
            </div>
            <div className='grid gap-1.5'>
              <Label className="text-xs font-semibold text-gray-700">Price (₹)</Label>
              <Input type='number' name="productPrice" value={productData.productPrice} onChange={handleChange} placeholder="999" className="h-9 text-sm focus-visible:ring-orange-500" required />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-1.5'>
              <Label className="text-xs font-semibold text-gray-700">Brand</Label>
              <Input name="brand" value={productData.brand} onChange={handleChange} placeholder="Apple" className="h-9 text-sm focus-visible:ring-orange-500" required />
            </div>
            <div className='grid gap-1.5'>
              <Label className="text-xs font-semibold text-gray-700">Category</Label>
              <Input name="category" value={productData.category} onChange={handleChange} placeholder="Electronics" className="h-9 text-sm focus-visible:ring-orange-500" required />
            </div>
          </div>

          <div className='grid gap-1.5'>
            <Label className="text-xs font-semibold text-gray-700">Description</Label>
            <Textarea name="productDesc" value={productData.productDesc} onChange={handleChange} placeholder="Enter details..." className="min-h-[70px] text-sm focus-visible:ring-orange-500 resize-none" required />
          </div>

          <div className="bg-orange-50/50 p-3 rounded-lg border border-dashed border-orange-200">
            <ImageUpload productData={productData} setProductData={setProductData} />
          </div>
        </CardContent>

        <CardFooter className="py-3 border-t border-gray-50">
          <Button disabled={loading} onClick={submitHandler} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 transition-all">
            {loading ? <span className='flex gap-2 items-center text-sm'><Loader2 className='animate-spin w-4 h-4' /> Saving...</span> : "Publish Product"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AddProduct