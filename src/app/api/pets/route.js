
import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const petsCollection = await getCollection('pets')
    const pets = await petsCollection.find({}).toArray()
    
    return NextResponse.json({ 
      success: true, 
      data: pets,
      count: pets.length 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pets' },
      { status: 500 }
    )
  }
}