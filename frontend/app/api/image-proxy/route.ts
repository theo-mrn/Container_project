import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    if (!contentType?.startsWith('image/')) {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 

