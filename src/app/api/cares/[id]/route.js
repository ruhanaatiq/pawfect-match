import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

// 🐾 GET single care tip by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid care ID' },
        { status: 400 }
      )
    }

    const caresCollection = await getCollection('cares')
    const care = await caresCollection.findOne({ _id: new ObjectId(id) })

    if (!care) {
      return NextResponse.json(
        { success: false, error: 'Care tip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: care })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch care detail' },
      { status: 500 }
    )
  }
}
