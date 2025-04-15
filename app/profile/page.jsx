// pages/profile.js
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit, MapPin, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto bg-white p-[2rem] md:p-8">
      {/* Profile Header */}
      <div className="border-b pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <Image
                src="/images/sarmad.png"
                alt="Profile picture"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Muhammad Sarmad</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Rawalpindi, Pakistan</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="text-2xl font-bold text-gray-800 mr-2">$7.00/hr</div>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-medium text-gray-800">Front-end developer | Figma to HTML, react, next js  <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5 text-gray-500" />
          </Button></h2>
        </div>
      </div>

      {/* Description */}
      <div className="py-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Description</h2>
          <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        <p className="text-gray-700">
          Hello there! 👋 As a proficient React.js and Next.js Developer, I specialize in converting Figma designs into fully 
          responsive websites (from mobile to desktop) with perfect quality. With over 3+ years of experience and 7 
          successful projects under my belt, I am well-versed in HTML, CSS, JavaScript, TypeScript, Tailwind CSS, Shadcn, 
          React.js, Next.js, Framer Motion, and GSAP.
        </p>
        <button className="text-blue-500 mt-2">more...</button>
      </div>

      {/* Portfolio */}
      <div className="py-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Portfolio</h2>
          <Button variant="ghost" size="icon">
            <PlusCircle className="h-5 w-5 text-green-500" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-lg border">
            <div className="h-40 relative">
              <Image 
                src="/images/hoobank.png" 
                alt="Gretich Website" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 bg-white">
              <p className="text-blue-500 hover:underline">Gretich Website</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border">
            <div className="h-40 relative">
              <Image 
                src="/images/hoobank.png" 
                alt="Hoobank website" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 bg-white">
              <p className="text-blue-500 hover:underline">Hoobank website</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border">
            <div className="h-40 relative">
              <Image 
                src="/images/hoobank.png" 
                alt="Gretich Website" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 bg-white">
              <p className="text-blue-500 hover:underline">Gretich Website</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="py-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Templates</h2>
          <Button variant="ghost" size="icon">
            <PlusCircle className="h-5 w-5 text-green-500" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-48">
                <Image 
                  src="/images/mind.png" 
                  alt="Template image"
                  fill 
                  className="object-cover"
                />
             
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-gray-800">You will get Dedicated premier pro viral editing templates</p>
                <p className="text-lg font-bold mt-1">$20</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="py-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Skills</h2>
          <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array(15).fill('Frontend').map((skill, index) => (
            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-1 rounded-full">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Work History */}
      <div className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Work History</h2>
          <Button variant="ghost" size="icon">
            <PlusCircle className="h-5 w-5 text-green-500" />
          </Button>
        </div>
        {[1, 2].map((item, index) => (
          <div key={index} className="mb-6 border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-4 bg-gray-50 border-r">
                <div className="mb-2">
                  <p className="text-gray-500 text-sm">Company</p>
                  <p className="font-semibold text-gray-700">FAST NUCES</p>
                </div>
                <div className="mb-2">
                  <p className="text-gray-500 text-sm">Position</p>
                  <p className="font-semibold text-gray-700">Full stack Developer</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Date</p>
                  <p className="text-gray-700">from: 12/03/2022</p>
                  <p className="text-gray-700">to: 12/03/2023</p>
                </div>
              </div>
              <div className="col-span-2 p-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-700">
                    Hello there! 👋 As a proficient React.js and Next.js Developer, I specialize in 
                    converting Figma designs into fully responsive websites (from mobile to 
                    desktop) with perfect quality. With over 3+ years of experience and 7 
                    successful projects under my belt, I am well-versed in HTML, CSS, 
                    JavaScript, TypeScript, Tailwind CSS, Shadcn, React.js, Next.js, Framer 
                    Motion, and
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}