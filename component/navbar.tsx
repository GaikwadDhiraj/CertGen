import React from 'react'
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { 
  Home, 
  Calendar, 
  Info, 
  Phone, 
  FileText,
  User
} from 'lucide-react'

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 h-16 border-b border-gray-200 bg-white sticky top-0 z-50">
      {/* Logo on left side */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="font-bold text-xl text-gray-800">CertGen</div>
      </div>
      
      {/* Navigation links and auth buttons on right side */}
      <div className="flex items-center gap-6">
        {/* Navigation Links with Icons */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            <li>
              <a href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a href="/events" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </a>
            </li>
            <li>
              <a href="/about" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Info className="w-5 h-5" />
                <span>About</span>
              </a>
            </li>
            <li>
              <a href="/contact" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Phone className="w-5 h-5" />
                <span>Contact</span>
              </a>
            </li>
            <li>
              <a href="/certificates" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <FileText className="w-5 h-5" />
                <span>Certificates</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-gray-200 hover:border-blue-500 transition-colors"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

export default Navbar