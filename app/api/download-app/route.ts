import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const { files, projectName } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const zip = new JSZip();

    // Add all files to the zip
    files.forEach((file: any) => {
      if (file.path && file.content) {
        zip.file(file.path, file.content);
      }
    });

    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Return the zip file as a response
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName || 'nexus-ai-project'}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error creating zip file:', error);
    return NextResponse.json({ error: 'Failed to create zip file' }, { status: 500 });
  }
}
