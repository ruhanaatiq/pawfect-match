// app/api/pets/[id]/route.js
import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

// GET single pet by ID
export async function GET(request, { params }) {
        // console.log(params)
  try {
    const { id } = await params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pet ID' },
        { status: 400 }
      )
    }

    const petsCollection = await getCollection('pets')
    const pet = await petsCollection.findOne({ _id: new ObjectId(id) })
    
    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Pet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: pet 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pet details' },
      { status: 500 }
    )
  }
}

// UPDATE pet by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pet ID' },
        { status: 400 }
      )
    }

    const petsCollection = await getCollection('pets')
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    }
    
    const result = await petsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Pet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Pet updated successfully' 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update pet' },
      { status: 500 }
    )
  }
}

// DELETE pet by ID
export async function DELETE(request, { params }) {

  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pet ID' },
        { status: 400 }
      )
    }

    const petsCollection = await getCollection('pets')
    const result = await petsCollection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Pet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pet deleted successfully' 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete pet' },
      { status: 500 }
    )
  }
}