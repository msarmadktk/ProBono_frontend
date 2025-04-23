'use client'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { MapPin, Edit, PlusCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

import Image from 'next/image'

import { Button } from '@/components/ui/button'

export default function ProfilePage () {
  const { user, isLoaded } = useUser()

  const defaultProfile = {
    email: 'your@email.com',
    profile_image: '/images/bruce.jpg',
    hourly_rate: 0,
    title: 'No title added yet.',
    bio: 'No description added yet.',
    skills: []
  }

  const [dbUserId, setDbUserId] = useState(null)
  const [profile, setProfile] = useState(defaultProfile)

  //________________________ Portfolio_______________________//
  const [portfolio, setPortfolio] = useState([])
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectMediaLink, setNewProjectMediaLink] = useState('')

  const [isAddingTemplate, setIsAddingTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [newTemplate, setNewTemplate] = useState({
    product_name: '',
    description: '',
    price: '',
    product_url: ''
  })

  const [products, setProducts] = useState([])
  const [workHistory, setWorkHistory] = useState([])
  const [isEditingWork, setIsEditingWork] = useState(false)
  const [editingWorkId, setEditingWorkId] = useState(null)

  const [isAddingWork, setIsAddingWork] = useState(false)
  const [newWork, setNewWork] = useState({
    company: '',
    position: '',
    description: '',
    from_date: '',
    to_date: ''
  })

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [isEditingSkills, setIsEditingSkills] = useState(false)
  const [editedSkills, setEditedSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [showFullBio, setShowFullBio] = useState(false)

  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null)

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchEverything = async () => {
      // Helper to get internal DB userId using Clerk email
      const getDbUserId = async email => {
        try {
          const res = await fetch('http://localhost:5000/api/getUserId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }) // body: {"email": "..."}
          })

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }

          const data = await res.json()
          return data.userId
        } catch (err) {
          console.error('Failed to get DB userId:', err)
          return null
        }
      }

      const email = user.emailAddresses[0].emailAddress
      const userId = await getDbUserId(email)
      if (!userId) return

      setDbUserId(userId) //  Persist userId in state for use in other functions

      const fetchOrCreateProfile = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/profiles/${userId}`
          )
          const data = res.data.profile || defaultProfile
          setProfile(data)
          setEditedTitle(data.title || '')
          setEditedBio(data.bio || '')
          setEditedSkills(data.skills || [])
          setPortfolio(res.data.portfolioItems || [])
        } catch (err) {
          if (err.response?.status === 404) {
            try {
              const res = await axios.post(
                'http://localhost:5000/api/profiles',
                {
                  userId,
                  email,
                  title: '',
                  skills: [],
                  hourly_rate: 0,
                  bio: '',
                  profile_image: '/images/bruce.jpg',
                  is_public: true
                }
              )

              const newProfile = res.data.profile
              setProfile(newProfile)
              setEditedTitle(newProfile.title || '')
              setEditedBio(newProfile.bio || '')
              setEditedSkills(newProfile.skills || [])
              setPortfolio([])
            } catch (createErr) {
              console.error('Failed to create profile:', createErr)
            }
          } else {
            console.error('Error fetching profile:', err)
          }
        }
      }

      const fetchOtherDetails = async () => {
        try {
          const productsRes = await axios.get(
            `http://localhost:5000/api/digital-products?userId=${userId}`
          )
          setProducts(productsRes.data || [])
        } catch (err) {
          console.error('Failed to fetch products:', err)
        }

        try {
          const workRes = await axios.get(
            `http://localhost:5000/api/work-history/${userId}`
          )
          setWorkHistory(workRes.data || [])
        } catch (err) {
          console.error('Failed to fetch work history:', err)
        }
      }

      await fetchOrCreateProfile()
      await fetchOtherDetails()
    }

    fetchEverything()
  }, [isLoaded, user])

  ////////////////////////// BIO ////////////////////////////////
  const saveBio = async () => {
    if (!user || !dbUserId) return

    try {
      const payload = { bio: editedBio }
      let res

      if (!profile) {
        res = await axios.post(`http://localhost:5000/api/profiles`, {
          ...payload,
          userId: dbUserId,
          email: user.emailAddresses[0].emailAddress,
          title: '',
          skills: [],
          hourly_rate: 0,
          profile_image: '/images/bruce.jpg'
        })
      } else {
        res = await axios.put(
          `http://localhost:5000/api/profiles/${dbUserId}`,
          payload
        )
      }

      if (res.data?.profile) {
        setProfile(res.data.profile)
        setIsEditingDescription(false)
      }
    } catch (error) {
      console.error('Failed to save bio:', error)
    }
  }

  const handleEditPortfolio = item => {
    setEditingPortfolioItem(item)
    setNewProjectTitle(item.project_title)
    setNewProjectDescription(item.description || '')
    try {
      const parsed = JSON.parse(item.media_links)
      setNewProjectMediaLink(parsed?.[0] || '')
    } catch {
      setNewProjectMediaLink('')
    }
    setIsAddingPortfolio(true)
  }

  const handleDeletePortfolio = async itemId => {
    try {
      await axios.delete(
        `http://localhost:5000/api/profiles/${dbUserId}/portfolio/${itemId}`
      )
      setPortfolio(portfolio.filter(p => p.id !== itemId))
    } catch (err) {
      console.error('Failed to delete portfolio item:', err)
    }
  }

  const addPortfolioItem = async () => {
    if (!user || !newProjectTitle.trim()) return

    try {
      const payload = {
        projectTitle: newProjectTitle,
        description: newProjectDescription,
        mediaLinks: JSON.stringify([newProjectMediaLink])
      }

      let res
      if (editingPortfolioItem) {
        res = await axios.put(
          `http://localhost:5000/api/profiles/${dbUserId}/portfolio/${editingPortfolioItem.id}`,
          payload
        )

        setPortfolio(
          portfolio.map(p =>
            p.id === editingPortfolioItem.id ? res.data.portfolioItem : p
          )
        )
      } else {
        res = await axios.post(
          `http://localhost:5000/api/profiles/${dbUserId}/portfolio`,
          payload
        )

        setPortfolio([...portfolio, res.data.portfolioItem])
      }

      // Reset form
      setNewProjectTitle('')
      setNewProjectDescription('')
      setNewProjectMediaLink('')
      setEditingPortfolioItem(null)
      setIsAddingPortfolio(false)
    } catch (error) {
      console.error('Failed to save portfolio item:', error)
    }
  }

  const addTemplate = async () => {
    if (!user || !newTemplate.product_name.trim()) return

    try {
      const payload = {
        freelancerId: dbUserId,
        productName: newTemplate.product_name,
        description: newTemplate.description,
        productUrl: newTemplate.product_url,
        price: newTemplate.price
      }

      let res
      if (editingTemplate) {
        // update existing template
        res = await axios.put(
          `http://localhost:5000/api/digital-products/${editingTemplate.id}`,
          payload
        )
        setProducts(
          products.map(p =>
            p.id === editingTemplate.id ? res.data.product : p
          )
        )
      } else {
        // create new template
        res = await axios.post(
          `http://localhost:5000/api/digital-products`,
          payload
        )
        setProducts([...products, res.data.product])
      }

      setNewTemplate({
        product_name: '',
        description: '',
        price: '',
        product_url: ''
      })
      setIsAddingTemplate(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  const deleteTemplate = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/digital-products/${id}`)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const addWorkEntry = async () => {
    if (!user || !newWork.company.trim() || !newWork.position.trim()) return

    try {
      const res = await axios.post(`http://localhost:5000/api/work-history`, {
        userId: dbUserId,
        ...newWork
      })

      if (res.data) {
        setWorkHistory([...workHistory, res.data])
        setNewWork({
          company: '',
          position: '',
          description: '',
          from_date: '',
          to_date: ''
        })
        setIsAddingWork(false)
      }
    } catch (error) {
      console.error('Failed to add work entry:', error)
    }
  }

  const saveWorkEntry = async () => {
    if (!user || !newWork.company || !newWork.position || !newWork.from_date)
      return

    try {
      const payload = {
        userId: dbUserId,
        companyName: newWork.company,
        position: newWork.position,
        startDate: newWork.from_date,
        endDate: newWork.to_date || null,
        description: newWork.description,
        isCurrent: !newWork.to_date
      }

      let res
      if (isEditingWork && editingWorkId) {
        res = await axios.put(
          `http://localhost:5000/api/work-history/${editingWorkId}`,
          payload
        )
        setWorkHistory(
          workHistory.map(w => (w.id === editingWorkId ? res.data.entry : w))
        )
      } else {
        res = await axios.post(
          `http://localhost:5000/api/work-history`,
          payload
        )
        setWorkHistory([...workHistory, res.data.entry])
      }

      // Reset
      setIsAddingWork(false)
      setIsEditingWork(false)
      setEditingWorkId(null)
      setNewWork({
        company: '',
        position: '',
        description: '',
        from_date: '',
        to_date: ''
      })
    } catch (error) {
      console.error('Failed to save work entry:', error)
    }
  }

  const startEditWork = entry => {
    setNewWork({
      company: entry.company_name,
      position: entry.position,
      description: entry.description,
      from_date: entry.start_date,
      to_date: entry.end_date || ''
    })
    setIsEditingWork(true)
    setIsAddingWork(true)
    setEditingWorkId(entry.id)
  }

  const deleteWorkEntry = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/work-history/${id}`)
      setWorkHistory(workHistory.filter(w => w.id !== id))
    } catch (error) {
      console.error('Failed to delete work entry:', error)
    }
  }

  return (
    <div className='max-w-6xl mx-auto bg-white p-8'>
      {/* Profile Header */}
      <div className='border-b pb-6'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between'>
          {/* Left side: Image + Email */}
          <div className='flex items-center gap-4'>
            <div className='relative h-16 w-16 rounded-full overflow-hidden border'>
              <img
                src={profile.profile_image || '/images/bruce.jpg'}
                alt='Profile'
                className='object-cover h-full w-full'
              />
            </div>
            <div>
              <h2 className='text-2xl font-semibold text-gray-800'>
                {profile.email}
              </h2>
              <div className='text-gray-500 flex items-center'>
                <MapPin className='h-4 w-4 mr-1' />
                Pakistan
              </div>
            </div>
          </div>

          {/* Right side: Hourly rate */}
          <div className='mt-4 md:mt-0 text-xl font-bold text-gray-800'>
            ${parseFloat(profile.hourly_rate || 0).toFixed(2)}/hr
          </div>
        </div>

        {/* Title Section */}
        <div className='mt-4'>
          {isEditingTitle ? (
            <div className='flex items-center gap-2'>
              <input
                type='text'
                className='w-full md:w-1/2 border rounded-md p-2 text-gray-800'
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
              />
              <Button
                size='sm'
                variant='outline'
                onClick={async () => {
                  if (!user) return
                  const res = await axios.put(
                    `http://localhost:5000/api/profiles/${dbUserId}`,
                    { title: editedTitle }
                  )
                  setProfile(res.data.profile)
                  setIsEditingTitle(false)
                }}
              >
                Save
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => {
                  setEditedTitle(profile.title || '')
                  setIsEditingTitle(false)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <h3 className='text-xl font-medium text-gray-800'>
                {profile.title}
              </h3>
              <Button
                size='icon'
                variant='ghost'
                onClick={() => setIsEditingTitle(true)}
              >
                <Edit className='h-5 w-5 text-gray-500' />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className='py-6 border-b'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-medium'>Description</h2>
          <div className='flex gap-2'>
            {isEditingDescription ? (
              <>
                <Button variant='outline' size='sm' onClick={saveBio}>
                  Save
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setIsEditingDescription(false)
                    setEditedBio(profile.bio || '')
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  setEditedBio(profile.bio || '')
                  setIsEditingDescription(true)
                }}
              >
                <Edit className='h-5 w-5 text-gray-500' />
              </Button>
            )}
          </div>
        </div>

        {isEditingDescription ? (
          <textarea
            className='w-full border rounded-md p-2 text-gray-800'
            rows={5}
            value={editedBio}
            onChange={e => setEditedBio(e.target.value)}
          />
        ) : (
          <p className='text-gray-700'>
            {showFullBio
              ? profile.bio || 'No description provided.'
              : (profile.bio || 'No description provided.').substring(0, 180) +
                ((profile.bio || '').length > 180 ? '...' : '')}
          </p>
        )}

        {!isEditingDescription && profile.bio?.length > 180 && (
          <button
            className='text-blue-500 mt-2 underline cursor-pointer'
            onClick={() => setShowFullBio(prev => !prev)}
          >
            {showFullBio ? 'less...' : 'more...'}
          </button>
        )}
      </div>

      {/* Portfolio */}
      <div className='py-6 border-b'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-medium'>Portfolio</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsAddingPortfolio(true)}
          >
            <PlusCircle className='h-5 w-5 text-green-500' />
          </Button>
        </div>

        {isAddingPortfolio && (
          <div className='mb-6'>
            <input
              type='text'
              placeholder='Project Title'
              className='w-full border p-2 rounded mb-2'
              value={newProjectTitle}
              onChange={e => setNewProjectTitle(e.target.value)}
            />
            <textarea
              placeholder='Description'
              className='w-full border p-2 rounded mb-2'
              rows={3}
              value={newProjectDescription}
              onChange={e => setNewProjectDescription(e.target.value)}
            />
            <input
              type='text'
              placeholder='Media Link (optional)'
              className='w-full border p-2 rounded mb-2'
              value={newProjectMediaLink}
              onChange={e => setNewProjectMediaLink(e.target.value)}
            />
            <div className='flex gap-2'>
              <Button onClick={addPortfolioItem} size='sm' variant='outline'>
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsAddingPortfolio(false)
                  setNewProjectTitle('')
                  setNewProjectDescription('')
                  setNewProjectMediaLink('')
                }}
                size='sm'
                variant='ghost'
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {portfolio.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {portfolio.map((item, index) => {
              let previewImage = ''

              try {
                const parsed = JSON.parse(item.media_links)
                if (Array.isArray(parsed) && parsed[0]) {
                  previewImage = parsed[0]
                }
              } catch (e) {}

              return (
                <div
                  key={index}
                  className='relative overflow-hidden rounded-lg border'
                >
                  <div className='h-40 relative'>
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt={item.project_title || 'Portfolio preview'}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, 33vw'
                      />
                    ) : (
                      <div className='h-full flex items-center justify-center text-gray-500 text-sm bg-gray-100'>
                        No image
                      </div>
                    )}
                  </div>
                  <div className='p-3 bg-white'>
                    <h3 className='text-blue-500 font-semibold'>
                      {item.project_title}
                    </h3>
                    {item.description && (
                      <p className='text-gray-600 mt-1 text-sm'>
                        {item.description}
                      </p>
                    )}
                    <div className='mt-2 flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditPortfolio(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDeletePortfolio(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className='text-gray-500'>No portfolio projects yet.</p>
        )}
      </div>

      {/* Templates */}
      <div className='py-6 border-b'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-medium'>Templates</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setIsAddingTemplate(true)
              setEditingTemplate(null) // New mode
              setNewTemplate({
                product_name: '',
                description: '',
                price: '',
                product_url: ''
              })
            }}
          >
            <PlusCircle className='h-5 w-5 text-green-500' />
          </Button>
        </div>

        {isAddingTemplate && (
          <div className='mb-6'>
            <input
              type='text'
              placeholder='Template Name'
              className='w-full border p-2 rounded mb-2'
              value={newTemplate.product_name}
              onChange={e =>
                setNewTemplate({ ...newTemplate, product_name: e.target.value })
              }
            />
            <textarea
              placeholder='Description'
              className='w-full border p-2 rounded mb-2'
              value={newTemplate.description}
              onChange={e =>
                setNewTemplate({ ...newTemplate, description: e.target.value })
              }
            />
            <input
              type='number'
              placeholder='Price'
              className='w-full border p-2 rounded mb-2'
              value={newTemplate.price}
              onChange={e =>
                setNewTemplate({ ...newTemplate, price: e.target.value })
              }
            />
            <input
              type='text'
              placeholder='Image URL'
              className='w-full border p-2 rounded mb-2'
              value={newTemplate.product_url}
              onChange={e =>
                setNewTemplate({ ...newTemplate, product_url: e.target.value })
              }
            />
            <div className='flex gap-2'>
              <Button onClick={addTemplate} size='sm' variant='outline'>
                {editingTemplate ? 'Update' : 'Save'}
              </Button>
              <Button
                onClick={() => {
                  setIsAddingTemplate(false)
                  setEditingTemplate(null)
                  setNewTemplate({
                    product_name: '',
                    description: '',
                    price: '',
                    product_url: ''
                  })
                }}
                size='sm'
                variant='ghost'
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {products?.length > 0 ? (
            products.map(template => {
              const imageUrl = template.product_url || '/images/bruce.jpg'

              return (
                <Card key={template.id} className='overflow-hidden relative'>
                  <div className='relative h-48'>
                    <img
                      src={imageUrl}
                      alt={template.product_name}
                      className='w-full h-full object-cover'
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
                    <div className='flex gap-2 mt-3'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditingTemplate(template)
                          setNewTemplate({
                            product_name: template.product_name,
                            description: template.description,
                            price: template.price,
                            product_url: template.product_url
                          })
                          setIsAddingTemplate(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => deleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <p className='text-gray-500'>No templates available.</p>
          )}
        </div>
      </div>

      {/* Work History */}
      <div className='py-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-medium'>Work History</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsAddingWork(true)}
          >
            <PlusCircle className='h-5 w-5 text-green-500' />
          </Button>
        </div>

        {isAddingWork && (
          <div className='mb-6 space-y-2'>
            <input
              type='text'
              placeholder='Company'
              className='w-full border p-2 rounded'
              value={newWork.company}
              onChange={e =>
                setNewWork({ ...newWork, company: e.target.value })
              }
            />
            <input
              type='text'
              placeholder='Position'
              className='w-full border p-2 rounded'
              value={newWork.position}
              onChange={e =>
                setNewWork({ ...newWork, position: e.target.value })
              }
            />
            <textarea
              placeholder='Description'
              className='w-full border p-2 rounded'
              value={newWork.description}
              onChange={e =>
                setNewWork({ ...newWork, description: e.target.value })
              }
            />
            <div className='flex gap-2'>
              <input
                type='date'
                className='w-full border p-2 rounded'
                value={newWork.from_date}
                onChange={e =>
                  setNewWork({ ...newWork, from_date: e.target.value })
                }
              />
              <input
                type='date'
                className='w-full border p-2 rounded'
                value={newWork.to_date}
                onChange={e =>
                  setNewWork({ ...newWork, to_date: e.target.value })
                }
              />
            </div>
            <div className='flex gap-2'>
              <Button size='sm' variant='outline' onClick={saveWorkEntry}>
                {isEditingWork ? 'Update' : 'Save'}
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => {
                  setIsAddingWork(false)
                  setIsEditingWork(false)
                  setEditingWorkId(null)
                  setNewWork({
                    company: '',
                    position: '',
                    description: '',
                    from_date: '',
                    to_date: ''
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {workHistory.length === 0 ? (
          <p className='text-gray-500'>No work history added yet.</p>
        ) : (
          workHistory.map((job, index) => (
            <div key={index} className='mb-6 border rounded-lg overflow-hidden'>
              <div className='grid grid-cols-1 md:grid-cols-3'>
                <div className='p-4 bg-gray-50 border-r'>
                  <div className='mb-2'>
                    <p className='text-gray-500 text-sm'>Company</p>
                    <p className='font-semibold text-gray-700'>
                      {job.company_name}
                    </p>
                  </div>
                  <div className='mb-2'>
                    <p className='text-gray-500 text-sm'>Position</p>
                    <p className='font-semibold text-gray-700'>
                      {job.position}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-500 text-sm font-medium'>
                      Start Date
                    </p>
                    <p className='text-gray-700'>
                      {new Date(job.start_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>

                    <p className='text-gray-500 text-sm font-medium mt-2'>
                      End Date
                    </p>
                    <p className='text-gray-700'>
                      {job.end_date
                        ? new Date(job.end_date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Present'}
                    </p>
                  </div> 
                </div>
                <div className='col-span-2 p-4 flex items-center justify-between'>
                  <p className='text-gray-700'>{job.description}</p>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => startEditWork(job)}
                    >
                      <Edit className='h-5 w-5 text-blue-500' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => deleteWorkEntry(job.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
