// pages/profile.js

'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { PlusCircle, Edit, MapPin, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'

export default function ProfilePage () {
  const [profile, setProfile] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [showFullBio, setShowFullBio] = useState(false)
  const [products, setProducts] = useState([])
  const [workHistory, setWorkHistory] = useState([]);


  useEffect(() => {
    const userId = 4 // Replace with actual logged-in user's ID later

    axios
      .get(`http://localhost:5000/api/profiles/${userId}`)
      .then(res => {
        setProfile(res.data.profile)
        setPortfolio(res.data.portfolioItems)
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err)
      })

    axios
      .get(`http://localhost:5000/api/digital-products?userId=${userId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error('Failed to fetch digital products:', err));

    axios
      .get(`http://localhost:5000/api/work-history/${userId}`)
      .then(res => {
        setWorkHistory(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch work history:', err);
  });

  }, [])

  return (
    <div className='max-w-6xl mx-auto bg-white p-[2rem] md:p-8'>
      {/* Profile Header */}
      {profile && (
        <div className='border-b pb-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='relative h-16 w-16 rounded-full overflow-hidden'>
                <Image
                  src={profile.profile_image || 'images/default.png'}
                  alt='Profile picture'
                  fill
                  sizes='64px'
                  className='object-cover'
                />
              </div>
              <div>
                <h1 className='text-2xl font-semibold text-gray-800'>
                  {profile.email}
                </h1>
                <div className='flex items-center text-gray-500 mt-1'>
                  <MapPin className='h-4 w-4 mr-1' />
                  <span>Pakistan</span>{' '}
                  {/* Update this if you store location */}
                </div>
              </div>
            </div>
            <div className='mt-4 md:mt-0 flex items-center'>
              <div className='text-2xl font-bold text-gray-800 mr-2'>
                ${parseFloat(profile.hourly_rate).toFixed(2)}/hr
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <h2 className='text-xl font-medium text-gray-800'>
              {profile.title}
              <Button variant='ghost' size='icon'>
                <Edit className='h-5 w-5 text-gray-500' />
              </Button>
            </h2>
          </div>
        </div>
      )}

      {/* Description */}
      {profile && (
        <div className='py-6 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-medium'>Description</h2>
            <Button variant='ghost' size='icon'>
              <Edit className='h-5 w-5 text-gray-500' />
            </Button>
          </div>
          <p className='text-gray-700'>
            {showFullBio
              ? profile.bio
              : profile.bio?.substring(0, 180) +
                (profile.bio?.length > 180 ? '...' : '')}
          </p>

          {profile.bio?.length > 180 && (
            <button
              className='text-blue-500 mt-2 underline cursor-pointer'
              onClick={() => setShowFullBio(prev => !prev)}
            >
              {showFullBio ? 'less...' : 'more...'}
            </button>
          )}
        </div>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className='py-6 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-medium'>Portfolio</h2>
            <Button variant='ghost' size='icon'>
              <PlusCircle className='h-5 w-5 text-green-500' />
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {portfolio.map((item, index) => {
              let previewImage = '/images/placeholder.png'

              try {
                const parsed = JSON.parse(item.media_links)
                if (Array.isArray(parsed) && parsed[0]) {
                  previewImage = parsed[0]
                }
              } catch (e) {
                // fallback remains placeholder
              }

              return (
                <div
                  key={index}
                  className='relative overflow-hidden rounded-lg border'
                >
                  <div className='h-40 relative'>
                    <Image
                      src={previewImage}
                      alt={item.project_title}
                      fill
                      sizes='(max-width: 768px) 100vw, 33vw'
                      className='object-cover'
                    />
                  </div>
                  <div className='p-3 bg-white'>
                    <p className='text-blue-500 hover:underline cursor-pointer'>
                      {item.project_title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Templates */}
      <div className='py-6 border-b'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-medium'>Templates</h2>
          <Button variant='ghost' size='icon'>
            <PlusCircle className='h-5 w-5 text-green-500' />
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {products?.length > 0 ? (
            products.map((template, index) => (
              <Card key={index} className='overflow-hidden'>
                <div className='relative h-48'>
                  <Image
                    src={template.image_url || '/images/placeholder.png'}
                    alt={template.title || 'Template image'}
                    fill
                    sizes='(max-width: 768px) 100vw, 33vw'
                    className='object-cover'
                  />
                </div>
                <CardContent className='p-4'>
                  <h3 className='text-md font-bold mb-1'>
                    {template.product_name}
                  </h3>
                  <p className='text-sm text-gray-800'>
                    {template.description}
                  </p>
                  <p className='text-lg font-bold mt-1'>${template.price}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className='text-gray-500'>No templates available.</p>
          )}
        </div>
      </div>

      {/* Skills */}
<div className='py-6 border-b'>
  <div className='flex items-center justify-between mb-4'>
    <h2 className='text-xl font-medium'>Skills</h2>
    <Button variant='ghost' size='icon'>
      <Edit className='h-5 w-5 text-gray-500' />
    </Button>
  </div>
  <div className='flex flex-wrap gap-2'>
    {profile?.skills && Array.isArray(profile.skills) ? (
      profile.skills.map((skill, index) => (
        <Badge
          key={index}
          variant='secondary'
          className='bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-1 rounded-full'
        >
          {skill}
        </Badge>
      ))
    ) : (
      <p className='text-gray-500'>No skills added yet.</p>
    )}
  </div>
</div>

      {/* Work History */}
<div className='py-6'>
  <div className='flex items-center justify-between mb-4'>
    <h2 className='text-xl font-medium'>Work History</h2>
    <Button variant='ghost' size='icon'>
      <PlusCircle className='h-5 w-5 text-green-500' />
    </Button>
  </div>

  {workHistory.length === 0 ? (
    <p className="text-gray-500">No work history added yet.</p>
  ) : (
    workHistory.map((job, index) => (
      <div key={index} className='mb-6 border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-3'>
          <div className='p-4 bg-gray-50 border-r'>
            <div className='mb-2'>
              <p className='text-gray-500 text-sm'>Company</p>
              <p className='font-semibold text-gray-700'>{job.company}</p>
            </div>
            <div className='mb-2'>
              <p className='text-gray-500 text-sm'>Position</p>
              <p className='font-semibold text-gray-700'>{job.position}</p>
            </div>
            <div>
              <p className='text-gray-500 text-sm'>Date</p>
              <p className='text-gray-700'>from: {job.from_date}</p>
              <p className='text-gray-700'>to: {job.to_date}</p>
            </div>
          </div>
          <div className='col-span-2 p-4 flex items-center justify-between'>
            <div>
              <p className='text-gray-700'>{job.description}</p>
            </div>
            <Button variant='ghost' size='icon'>
              <Edit className='h-5 w-5 text-gray-500' />
            </Button>
          </div>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  )
}
