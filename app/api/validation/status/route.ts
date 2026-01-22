import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    // Check for running validation processes
    const command = 'ps aux | grep -E "validate:(tables|functions|endpoints|references|all)" | grep -v grep'

    try {
      const { stdout } = await execAsync(command)
      const processes = stdout
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          // Extract validation type from process command
          const match = line.match(/validate:(tables|functions|endpoints|references|all)/)
          return match ? match[1] : null
        })
        .filter(Boolean)

      return NextResponse.json({
        running: processes.length > 0,
        processes,
        count: processes.length,
      })
    } catch (error) {
      // No matching processes found
      return NextResponse.json({
        running: false,
        processes: [],
        count: 0,
      })
    }
  } catch (error: any) {
    console.error('[API] Status check error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
