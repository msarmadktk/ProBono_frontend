// pages/index.js
'use client'
import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Home() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [experienceLevelOpen, setExperienceLevelOpen] = useState(false);
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [clientLocationOpen, setClientLocationOpen] = useState(false);

  const freelancers = [
    {
      id: 1,
      name: "Muhammad Sarmad",
      title: "Frontend Developer | React js",
      location: "Pakistan",
      hourlyRate: 36,
      rating: 4.4,
      totalEarned: "1000M",
      skills: ["Frontend"],
      bio: "I'm Sarmad, a passionate Frontend Developer and WordPress Specialist with a focus on creating professional, engaging websites. My journey began in 2015, right after completing my design studies, driven by a deep love for arts and creativity."
    },
    {
      id: 2,
      name: "Muhammad Sarmad",
      title: "Frontend Developer | React js",
      location: "Pakistan",
      hourlyRate: 36,
      rating: 4.4,
      totalEarned: "1000M",
      skills: ["Frontend"],
      bio: "I'm Sarmad, a passionate Frontend Developer and WordPress Specialist with a focus on creating professional, engaging websites. My journey began in 2015, right after completing my design studies, driven by a deep love for arts and creativity."
    }
  ];

  return (
    <div className="container mx-auto py-8 ">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left sidebar */}
        <div className="w-full md:w-64 space-y-4">
          {/* Categories */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer bg-gray-100"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <h3 className="font-medium text-gray-800 ">Categories</h3>
              {categoriesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {categoriesOpen && (
              <div className="p-4 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between">
                      Search Categories
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Web Development</DropdownMenuItem>
                    <DropdownMenuItem>Mobile Development</DropdownMenuItem>
                    <DropdownMenuItem>UI/UX Design</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Experience Level */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer bg-gray-100"
              onClick={() => setExperienceLevelOpen(!experienceLevelOpen)}
            >
              <h3 className="font-medium text-gray-800">Experience Level</h3>
              {experienceLevelOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {experienceLevelOpen && (
              <div className="p-4 border-t space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="entry" />
                  <label htmlFor="entry" className="text-sm cursor-pointer">Entry level</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="intermediate" />
                  <label htmlFor="intermediate" className="text-sm cursor-pointer">Intermediate</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="expert" />
                  <label htmlFor="expert" className="text-sm cursor-pointer">Expert</label>
                </div>
              </div>
            )}
          </div>

          {/* Job Type */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer bg-gray-100"
              onClick={() => setJobTypeOpen(!jobTypeOpen)}
            >
              <h3 className="font-medium text-gray-800">Job Type</h3>
              {jobTypeOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {jobTypeOpen && (
              <div className="p-4 border-t space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hourly" />
                  <label htmlFor="hourly" className="text-sm cursor-pointer">Hourly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="fixed" />
                  <label htmlFor="fixed" className="text-sm cursor-pointer">Fixed</label>
                </div>
              </div>
            )}
          </div>

          {/* Client Location */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer bg-gray-100"
              onClick={() => setClientLocationOpen(!clientLocationOpen)}
            >
              <h3 className="font-medium text-gray-800">Client Location</h3>
              {clientLocationOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {clientLocationOpen && (
              <div className="p-4 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between">
                      Search Location
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>United States</DropdownMenuItem>
                    <DropdownMenuItem>United Kingdom</DropdownMenuItem>
                    <DropdownMenuItem>Canada</DropdownMenuItem>
                    <DropdownMenuItem>Australia</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Search bar */}
          <div className="mb-6 relative">
            <Input 
              type="text" 
              placeholder="Search for talent" 
              className="pl-10 pr-4 py-2 w-full rounded-md h-[3rem]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Freelancer profiles */}
          <div className="space-y-6">
            {freelancers.map((freelancer) => (
              <div key={freelancer.id} className="border rounded-lg p-6 bg-white">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Profile image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-blue-600 overflow-hidden">
                      <img 
                        src="/images/sarmad.png" 
                        alt={freelancer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Profile info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-gray-500 font-medium">{freelancer.name}</h3>
                      <h2 className="text-xl font-bold">{freelancer.title}</h2>
                      <p className="text-gray-500">{freelancer.location}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center text-gray-500">
                      <span className="font-medium">${freelancer.hourlyRate.toFixed(2)} / hr</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">{freelancer.rating} / 5</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">${freelancer.totalEarned} earned</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-gray-700">{freelancer.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}