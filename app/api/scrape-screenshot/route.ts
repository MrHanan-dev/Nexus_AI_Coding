import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

      // Use NexusAI API to capture screenshot
  const nexusaiResponse = await fetch('https://api.nexusai.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXUSAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['screenshot'], // Regular viewport screenshot, not full page
        waitFor: 3000, // Wait for page to fully load
        timeout: 30000,
        blockAds: true,
        actions: [
          {
            type: 'wait',
            milliseconds: 2000 // Additional wait for dynamic content
          }
        ]
      })
    });

    if (!nexusaiResponse.ok) {
      const error = await nexusaiResponse.text();
      throw new Error(`NexusAI API error: ${error}`);
    }

    const data = await nexusaiResponse.json();
    
    if (!data.success || !data.data?.screenshot) {
      throw new Error('Failed to capture screenshot');
    }

    return NextResponse.json({
      success: true,
      screenshot: data.data.screenshot,
      metadata: data.data.metadata
    });

  } catch (error: any) {
    console.error('Screenshot capture error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to capture screenshot' 
    }, { status: 500 });
  }
}