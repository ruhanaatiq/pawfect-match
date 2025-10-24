// app/api/donations/route.js
import { getCollection } from '@/lib/dbConnect'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const donationsCollection = await getCollection('donations')
    
    // ✅ Check if this session_id already exists
    const existingDonation = await donationsCollection.findOne({
      stripe_session_id: body.sessionId
    })
    
    if (existingDonation) {
      // console.log('⚠️ Donation already saved:', body.sessionId)
      return NextResponse.json({ 
        success: true,
        message: 'Donation already recorded',
        data: existingDonation
      })
    }
    // console.log(body.email)
    
    // ✅ If not exists, save new donation
    const donationData = {
      stripe_session_id: body.sessionId,
      amount: body.amount,
      currency: 'usd',
      donation_type: body.donationType,
      status: 'completed',
      donor_email: body.email ,
      donor_name: body.name ,
      created_at: new Date()
    }
    
    const result = await donationsCollection.insertOne(donationData)
    
    return NextResponse.json({ 
      success: true,
      message: 'Donation saved successfully', 
      data: result 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET donations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    const donationsCollection = await getCollection('donations')
    
    const query = email ? { donor_email: email } : {}
    const donations = await donationsCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray()
    
    // Calculate total donated
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0)
    
    return NextResponse.json({ 
      success: true, 
      data: donations,
      count: donations.length,
      totalDonated: totalDonated
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}