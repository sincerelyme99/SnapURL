import "./globals.css"
import Navbar from "../components/Navbar"
import "./globals.css"
import { Toaster } from "react-hot-toast"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        {/*----GLOBAL NAVBAR-----*/}
       <Navbar />
        {children}

        <Toaster position="top-right" />

      </body>
    </html>
  )
}