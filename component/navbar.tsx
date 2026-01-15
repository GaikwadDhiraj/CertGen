import React from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const Navbar = () => {
  return (
    <div >
        <div>Logo Certgen</div>
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <div>Logo Certgen</div>
            <ul className="flex justify-end items-center p-4 gap-6 h-16">
                <li>Home</li>
                <li>Events</li>
                <li>About</li>
                <li>Contact us</li>
                <li>Certificate</li>
            </ul>
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
    </div>
  )
}

export default Navbar