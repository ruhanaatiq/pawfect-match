// app/api/feedback/[id]/route.js
import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

// GET single feedback by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    // Check if ID is valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      )
    }

    const feedbackCollection = await getCollection('feedback')
    const feedback = await feedbackCollection.findOne({ _id: new ObjectId(id) })
    
    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: feedback 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// PUT - Full update (replace entire document)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      )
    }

    // Validate required fields for full update
    if (!body.user_email || !body.user_name || !body.rating || !body.feedback) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const feedbackCollection = await getCollection('feedback')
    
    // Replace entire document (except _id)
    const updateData = {
      user_email: body.user_email,
      user_name: body.user_name,
      user_role: body.user_role || 'Pet Adopter',
      user_image: body.user_image || '',
      rating: parseInt(body.rating),
      feedback: body.feedback,
      location: body.location || '',
      created_at: body.created_at ? new Date(body.created_at) : new Date(),
      updated_at: new Date()
    }
    
    const result = await feedbackCollection.replaceOne(
      { _id: new ObjectId(id) },
      updateData
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback updated successfully',
      data: result
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update (update only provided fields)
export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      )
    }

    const feedbackCollection = await getCollection('feedback')
    
    // Build update object with only provided fields
    const updateData = {}
    
    if (body.user_email) updateData.user_email = body.user_email
    if (body.user_name) updateData.user_name = body.user_name
    if (body.user_role) updateData.user_role = body.user_role
    if (body.user_image !== undefined) updateData.user_image = body.user_image
    if (body.rating) updateData.rating = parseInt(body.rating)
    if (body.feedback) updateData.feedback = body.feedback
    if (body.location !== undefined) updateData.location = body.location
    
    // Always update the updated_at field
    updateData.updated_at = new Date()
    
    const result = await feedbackCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback updated successfully',
      data: result,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

// DELETE feedback by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback ID' },
        { status: 400 }
      )
    }

    const feedbackCollection = await getCollection('feedback')
    const result = await feedbackCollection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}