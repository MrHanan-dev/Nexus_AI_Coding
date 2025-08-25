import { NextRequest, NextResponse } from 'next/server';
import { AICodePredictor, PredictionContext } from '@/lib/ai/code-prediction';

const predictor = new AICodePredictor();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentCode, cursorPosition, fileType, projectContext, userHistory, commonPatterns, imports, dependencies } = body;

    if (!currentCode || fileType === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: currentCode, fileType' },
        { status: 400 }
      );
    }

    const context: PredictionContext = {
      currentCode,
      cursorPosition: cursorPosition || 0,
      fileType,
      projectContext: projectContext || '',
      userHistory: userHistory || [],
      commonPatterns: commonPatterns || [],
      imports: imports || [],
      dependencies: dependencies || []
    };

    const predictions = await predictor.predictCode(context);

    return NextResponse.json({
      success: true,
      predictions,
      stats: predictor.getPredictionStats()
    });

  } catch (error) {
    console.error('Code prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate code predictions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern } = body;

    if (!pattern) {
      return NextResponse.json(
        { error: 'Missing pattern data' },
        { status: 400 }
      );
    }

    predictor.updateUserPattern(pattern);

    return NextResponse.json({
      success: true,
      message: 'User pattern updated successfully'
    });

  } catch (error) {
    console.error('Pattern update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user pattern' },
      { status: 500 }
    );
  }
}
