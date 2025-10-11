// app/api/feedback/route.js
import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'

// GET all feedback
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const email = searchParams.get('email') // Filter by user email
    
    const feedbackCollection = await getCollection('feedback')
    
    // Build query
    let filter = {}
    if (email) {
      filter.user_email = email
    }
    
    let query = feedbackCollection
      .find(filter)
      .sort({ created_at: -1 })
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const feedbacks = await query.toArray()
    
    // Calculate average rating
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0
    
    return NextResponse.json({ 
      success: true, 
      data: feedbacks,
      count: feedbacks.length,
      averageRating: avgRating.toFixed(1)
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// POST new feedback
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.user_email || !body.user_name || !body.rating || !body.feedback) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const feedbackCollection = await getCollection('feedback')
    
    const feedbackData = {
      user_email: body.user_email,
      user_name: body.user_name,
      user_role: body.user_role || 'Pet Adopter',
      user_image: body.user_image || '',
      rating: parseInt(body.rating),
      feedback: body.feedback,
      location: body.location || '',
      created_at: new Date()
    }
    
    const result = await feedbackCollection.insertOne(feedbackData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Feedback submitted successfully!',
      data: result,
      insertedId: result.insertedId 
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}