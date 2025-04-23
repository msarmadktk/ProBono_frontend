'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  SignedIn,
  SignedOut,
  useUser,
  UserButton,
  SignInButton,
  SignUpButton,
} from '@clerk/clerk-react';

const defaultLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/' },
  { label: 'Categories', href: '/' },
];

const freelancerLinks = [
  { label: 'Profile', href: '/profile' },
  { label: 'Find Work', href: '/find-work' },
  { label: 'Buy Connects', href: '/buy-connects' },
  { label: 'Learn', href: '/learn' },
];

const clientLinks = [
  { label: 'Post Job', href: '/post-job' },
  { label: 'Hire Talent', href: '/hire-talent' },
  { label: 'Digital Products', href: '/digital-products' },
];

const adminLinks = [
  { label: 'Manage Jobs', href: '/admin/manage-jobs' },
  { label: 'User Management', href: '/admin/manage-users' },
  { label: 'Resolve Dispute', href: '/admin/manage-queries' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Talent');
  const [navLinks, setNavLinks] = useState(defaultLinks);

  const { user } = useUser();

  const options = ['Talent', 'Jobs', 'Templates'];

  useEffect(() => {
    if (user && user.unsafeMetadata?.role === 'freelancer') {
      setNavLinks(freelancerLinks);
    } else if (user && user.unsafeMetadata?.role === 'client') {
      setNavLinks(clientLinks);
    } else if (user && user.unsafeMetadata?.role === 'admin') {
      setNavLinks(adminLinks);
    } else {
      setNavLinks(defaultLinks);
    }
  }, [user]);

  return (
    <div className="px-4 sm:px-6 py-4">
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 bg-primary rounded-lg">
        {/* Logo + Navigation */}
        <div className="flex items-center flex-shrink-0">
          <div className="mr-6">
            <Image src="/images/icon.svg" alt="Logo" width={40} height={40} />
          </div>
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link, idx) => (
              <Link key={idx} href={link.href}>
                <span className="text-black hover:text-gray-700 font-medium cursor-pointer">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center w-full max-w-2xl mx-4">
          <div className="flex items-center w-full bg-white rounded-full shadow-lg border border-gray-300">
            <div className="flex items-center flex-grow pl-4">
              <Image src="/images/search.svg" alt="Search" width={20} height={20} className="opacity-60 mr-2" />
              <input
                type="text"
                placeholder={`Search ${selectedOption.toLowerCase()}`}
                className="w-full py-2 text-gray-500 placeholder-gray-400 outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex-shrink-0">
              <button
                className="flex items-center bg-gray-100 h-full px-4 py-2 rounded-r-full border-l border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-medium text-gray-700">{selectedOption}</span>
                <Image src="/images/arrowDown.svg" alt="Dropdown arrow" width={16} height={16} className="ml-2" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {options.map((option) => (
                    <button
                      key={option}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSelectedOption(option);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auth & Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="hidden sm:flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="text-black font-medium px-4 py-2 rounded-md cursor-pointer">Login</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-teal-400 text-black font-bold px-4 py-2 rounded-md cursor-pointer">Sign Up</button>
              </SignUpButton>
            </div>
          </SignedOut>
          <button className="md:hidden flex items-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute right-0 left-0 bg-white z-50 shadow-md mt-2 mx-4 rounded-lg">
          <div className="flex flex-col px-4 py-2">
            <div className="py-2 border-b border-gray-100">
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                <input
                  type="text"
                  placeholder="Search"
                  className="px-4 py-2 w-full outline-none text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {navLinks.map((link, idx) => (
              <Link key={idx} href={link.href}>
                <span className="block py-2 border-b border-gray-100 text-black">
                  {link.label}
                </span>
              </Link>
            ))}
            <SignedIn>
              <div className="py-2 border-b border-gray-100 scale-8">
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="py-2 border-b border-gray-100 text-black w-full text-left">Login</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-teal-400 text-black font-bold px-4 py-2 rounded-md mt-2">Sign Up</button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
