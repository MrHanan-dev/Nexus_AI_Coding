import { NextRequest, NextResponse } from 'next/server';
import { SmartDebugger } from '@/lib/ai/smart-debugging';

const smartDebugger = new SmartDebugger();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, filePath, language, action } = body;

    if (!code || !filePath || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: code, filePath, language' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'analyze':
        const issues = await smartDebugger.analyzeCode(code, filePath, language);
        return NextResponse.json({
          success: true,
          issues,
          stats: smartDebugger.getDebugStats()
        });

      case 'suggest-fix':
        const { issueId } = body;
        if (!issueId) {
          return NextResponse.json(
            { error: 'Missing issueId for fix suggestion' },
            { status: 400 }
          );
        }
        
        // For now, we'll analyze the code and find the issue
        const allIssues = await smartDebugger.analyzeCode(code, filePath, language);
        const issue = allIssues.find(i => i.id === issueId);
        
        if (!issue) {
          return NextResponse.json(
            { error: 'Issue not found' },
            { status: 404 }
          );
        }
        
        const suggestedFix = await smartDebugger.suggestFix(issue);
        return NextResponse.json({
          success: true,
          issue,
          suggestedFix
        });

      case 'create-session':
        const { projectType, framework } = body;
        const sessionId = smartDebugger.createDebugSession(projectType || 'web', language, framework);
        return NextResponse.json({
          success: true,
          sessionId
        });

      case 'resolve-issue':
        const { sessionId: session, issueId: issueToResolve } = body;
        if (!session || !issueToResolve) {
          return NextResponse.json(
            { error: 'Missing sessionId or issueId' },
            { status: 400 }
          );
        }
        
        const resolved = smartDebugger.resolveIssue(session, issueToResolve);
        return NextResponse.json({
          success: true,
          resolved,
          stats: smartDebugger.getDebugStats()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, suggest-fix, create-session, or resolve-issue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Smart debugging error:', error);
    return NextResponse.json(
      { error: 'Failed to process debugging request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = smartDebugger.getDebugStats();
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Smart debugging stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get debugging stats' },
      { status: 500 }
    );
  }
}
