"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Link as LinkIcon, LayoutDashboard, BarChart3 } from "lucide-react"

export default function Sidebar(){

const pathname = usePathname()

function navStyle(path){

return `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
pathname === path
? "bg-indigo-100 text-indigo-600 font-medium"
: "hover:bg-gray-100"
}`

}

return(

<div className="w-64 min-h-screen bg-white border-r shadow-sm p-6">

<h1 className="text-2xl font-bold mb-10 text-indigo-600">
ShortLink
</h1>

<nav className="flex flex-col gap-3">

<Link href="/" className={navStyle("/")}>
<LinkIcon size={18}/>
Shorten
</Link>

<Link href="/dashboard" className={navStyle("/dashboard")}>
<LayoutDashboard size={18}/>
Dashboard
</Link>

<Link href="/analytics" className={navStyle("/analytics")}>
<BarChart3 size={18}/>
Analytics
</Link>

</nav>

</div>

)

}