import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app.config';

export async function POST(request: NextRequest) {
  try {
    const { prompt, code } = await request.json();

    // Call AI service for code review
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nCode to review:\n\`\`\`\n${code}\n\`\`\`\n\nPlease provide a comprehensive code review in JSON format with the following structure:\n{\n  "score": number (0-100),\n  "suggestions": [\n    {\n      "type": "style|performance|security|best-practice|readability",\n      "message": "string",\n      "line": number,\n      "priority": "low|medium|high|critical",\n      "fix": "string"\n    }\n  ],\n  "issues": [\n    {\n      "type": "error|warning|info",\n      "message": "string",\n      "line": number,\n      "severity": "low|medium|high|critical",\n      "category": "syntax|logic|security|performance"\n    }\n  ],\n  "improvements": [\n    {\n      "type": "refactor|optimization|modernization",\n      "description": "string",\n      "impact": "low|medium|high",\n      "effort": "low|medium|high",\n      "code": "string",\n      "improvedCode": "string"\n    }\n  ],\n  "security": {\n    "vulnerabilities": [\n      {\n        "type": "string",\n        "description": "string",\n        "severity": "low|medium|high|critical",\n        "line": number,\n        "fix": "string"\n      }\n    ],\n    "riskScore": number (0-100),\n    "recommendations": ["string"]\n  },\n  "performance": {\n    "bottlenecks": [\n      {\n        "type": "string",\n        "description": "string",\n        "impact": "low|medium|high",\n        "line": number,\n        "optimization": "string"\n      }\n    ],\n    "score": number (0-100),\n    "suggestions": ["string"]\n  }\n}`
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const reviewResult = JSON.parse(aiData.content[0].text);

    return NextResponse.json(reviewResult);
  } catch (error) {
    console.error('Code review error:', error);
    return NextResponse.json(
      { error: 'Failed to perform code review' },
      { status: 500 }
    );
  }
}
