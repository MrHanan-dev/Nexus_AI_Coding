import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { command, sandboxId } = await request.json();

    if (!command) {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 });
    }

    // For now, we'll simulate command execution
    // In a real implementation, this would execute commands in the E2B sandbox
    let output = '';
    
    switch (command.toLowerCase()) {
      case 'ls':
      case 'dir':
        output = 'app/\npackage.json\nREADME.md\nnode_modules/\n';
        break;
      case 'pwd':
        output = '/workspace';
        break;
      case 'npm install':
        output = 'Installing dependencies...\nadded 1234 packages in 2.3s';
        break;
      case 'npm start':
        output = 'Starting development server...\nServer running on http://localhost:3000';
        break;
      case 'git status':
        output = 'On branch main\nYour branch is up to date with origin/main.';
        break;
      case 'git init':
        output = 'Initialized empty Git repository in /workspace/.git/';
        break;
      default:
        output = `Command executed: ${command}\nOutput: Command completed successfully`;
    }

    return NextResponse.json({ 
      success: true, 
      output,
      command 
    });
  } catch (error) {
    console.error('Error executing command:', error);
    return NextResponse.json({ error: 'Failed to execute command' }, { status: 500 });
  }
}
