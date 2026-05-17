import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ['cash_enabled', 'qris_enabled'] } },
    })

    const settingsMap = Object.fromEntries(
      settings.map((setting) => [setting.key, setting.value])
    )

    return NextResponse.json({
      cashEnabled: settingsMap.cash_enabled !== 'false',
      qrisEnabled: settingsMap.qris_enabled !== 'false',
    })
  } catch (error) {
    console.error('Failed to fetch public settings:', error)
    return NextResponse.json(
      { cashEnabled: true, qrisEnabled: true },
      { status: 500 }
    )
  }
}
