import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { context, language, category, existingTemplates } = await request.json();

    // Call AI service to generate templates
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
            content: `Generate 2-3 smart code templates based on the following context:

Context: ${context}
Language: ${language}
Category: ${category || 'any'}

Existing templates to avoid duplication:
${JSON.stringify(existingTemplates, null, 2)}

Please generate templates in JSON format with the following structure:
[
  {
    "id": "unique-id",
    "name": "Template Name",
    "description": "Template description",
    "category": "component|function|class|api|database|test|config|utility|hook|style|deployment|security",
    "language": "${language}",
    "framework": "optional-framework",
    "code": "Template code with {{variables}}",
    "variables": [
      {
        "name": "variableName",
        "type": "string|number|boolean|array|object",
        "description": "Variable description",
        "defaultValue": "optional default",
        "required": true
      }
    ],
    "tags": ["tag1", "tag2"],
    "isAI": true
  }
]

Make sure the templates are practical, well-structured, and include proper variable placeholders.`
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const templates = JSON.parse(aiData.content[0].text);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate templates' },
      { status: 500 }
    );
  }
}
