// Vercel API route
// Accepts a string and an array of strings as arguments (query parameters)
// Uses encryptData from @swiftprotocol/guard-v1 to encrypt the string

import { encrypt } from '@swiftprotocol/guard-v1'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, recipients } = body

  const encryptedData = await encrypt({ data, recipients })

  return NextResponse.json({ encryptedData })
}
