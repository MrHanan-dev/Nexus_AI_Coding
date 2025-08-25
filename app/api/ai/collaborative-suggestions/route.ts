import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, fileId, content, context } = await request.json();

    // Call AI service for collaborative suggestions
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Analyze this code in a collaborative coding session and provide suggestions for improvements:

Code:
\`\`\`
${content}
\`\`\`

Session Context:
- Participants: ${context.participants}
- Files: ${context.files}
- Recent changes: ${JSON.stringify(context.recentChanges)}
- Chat history: ${JSON.stringify(context.chatHistory)}

Please provide 2-3 suggestions in JSON format:
[
  {
    "id": "unique-id",
    "type": "refactor|optimization|bug-fix|feature",
    "description": "Suggestion description",
    "code": "Optional code example",
    "confidence": 0.8,
    "suggestedBy": "AI Assistant"
  }
]

Focus on collaborative improvements that would benefit the team.`
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const suggestions = JSON.parse(aiData.content[0].text);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Collaborative suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate collaborative suggestions' },
      { status: 500 }
    );
  }
}
