import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'

// 🐾 GET all pet care tips
export async function GET() {
  try {
    const caresCollection = await getCollection('cares')
    const cares = await caresCollection.find({}).toArray()

    if (!cares || cares.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No care data found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: cares })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch care data' },
      { status: 500 }
    )
  }
}
