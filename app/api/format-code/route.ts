import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const formattedFiles = files.map((file: any) => {
      if (!file.content) return file;

      let formattedContent = file.content;

      // Basic formatting for different file types
      if (file.path.endsWith('.js') || file.path.endsWith('.jsx') || 
          file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        // Basic JavaScript/TypeScript formatting
        formattedContent = formattedContent
          .replace(/\s+/g, ' ') // Remove extra whitespace
          .replace(/\s*{\s*/g, ' {\n  ') // Format opening braces
          .replace(/\s*}\s*/g, '\n}\n') // Format closing braces
          .replace(/;\s*/g, ';\n  ') // Format semicolons
          .replace(/,\s*/g, ', ') // Format commas
          .replace(/\n\s*\n/g, '\n\n') // Remove extra blank lines
          .trim();
      } else if (file.path.endsWith('.css') || file.path.endsWith('.scss')) {
        // Basic CSS formatting
        formattedContent = formattedContent
          .replace(/\s*{\s*/g, ' {\n  ')
          .replace(/\s*}\s*/g, '\n}\n')
          .replace(/;\s*/g, ';\n  ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
      } else if (file.path.endsWith('.json')) {
        try {
          // Format JSON
          const parsed = JSON.parse(file.content);
          formattedContent = JSON.stringify(parsed, null, 2);
        } catch (e) {
          // If JSON parsing fails, return original content
          formattedContent = file.content;
        }
      } else if (file.path.endsWith('.html')) {
        // Basic HTML formatting
        formattedContent = formattedContent
          .replace(/>\s*</g, '>\n<') // Add line breaks between tags
          .replace(/\n\s*\n/g, '\n\n') // Remove extra blank lines
          .trim();
      }

      return {
        ...file,
        content: formattedContent
      };
    });

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error formatting code:', error);
    return NextResponse.json({ error: 'Failed to format code' }, { status: 500 });
  }
}
