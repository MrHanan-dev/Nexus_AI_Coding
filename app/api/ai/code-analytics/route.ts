import { NextRequest, NextResponse } from 'next/server';
import { CodeAnalyticsEngine } from '@/lib/ai/code-analytics';

const analyticsEngine = new CodeAnalyticsEngine();

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
        const metrics = await analyticsEngine.analyzeCode(code, filePath, language);
        return NextResponse.json({
          success: true,
          metrics
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Code analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const projectId = searchParams.get('projectId') || 'default-project';
    const filePath = searchParams.get('filePath');
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'daily';

    switch (action) {
      case 'project':
        const projectAnalytics = analyticsEngine.getProjectAnalytics(projectId);
        return NextResponse.json({
          success: true,
          analytics: projectAnalytics
        });

      case 'history':
        if (!filePath) {
          return NextResponse.json(
            { error: 'Missing filePath parameter' },
            { status: 400 }
          );
        }
        const history = analyticsEngine.getMetricsHistory(filePath);
        return NextResponse.json({
          success: true,
          history
        });

      case 'insights':
        const insights = analyticsEngine.getInsights();
        return NextResponse.json({
          success: true,
          insights
        });

      case 'trends':
        const trends = analyticsEngine.getTrends(period);
        return NextResponse.json({
          success: true,
          trends
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: project, history, insights, or trends' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Code analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}
