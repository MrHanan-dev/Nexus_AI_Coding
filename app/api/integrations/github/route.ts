import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Initialize GitHub client
const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
let octokit: Octokit | null = null;

// Only initialize if token is available
if (githubToken && githubToken.trim() !== '') {
  try {
    octokit = new Octokit({
      auth: githubToken,
    });
  } catch (error) {
    console.error('Failed to initialize GitHub client:', error);
    octokit = null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!octokit) {
      return NextResponse.json(
        { error: 'GitHub is not configured. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-repository':
        const { name, description, private: isPrivate = false, autoInit = true } = data;
        
        const { data: repo } = await octokit.repos.createForAuthenticatedUser({
          name,
          description,
          private: isPrivate,
          auto_init: autoInit,
        });

        return NextResponse.json({
          success: true,
          repository: repo,
          cloneUrl: repo.clone_url,
          sshUrl: repo.ssh_url,
        });

      case 'create-branch':
        const { owner, repo: repoName, baseBranch = 'main', newBranch } = data;
        
        // Get the latest commit from base branch
        const { data: baseRef } = await octokit.git.getRef({
          owner,
          repo: repoName,
          ref: `heads/${baseBranch}`,
        });

        // Create new branch
        await octokit.git.createRef({
          owner,
          repo: repoName,
          ref: `refs/heads/${newBranch}`,
          sha: baseRef.object.sha,
        });

        return NextResponse.json({
          success: true,
          branch: newBranch,
          message: 'Branch created successfully',
        });

      case 'create-file':
        const { 
          owner: fileOwner, 
          repo: fileRepo, 
          path, 
          message, 
          content, 
          branch: fileBranch = 'main' 
        } = data;
        
        const { data: fileData } = await octokit.repos.createOrUpdateFileContents({
          owner: fileOwner,
          repo: fileRepo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          branch: fileBranch,
        });

        return NextResponse.json({
          success: true,
          file: fileData,
          commit: fileData.commit,
        });

      case 'create-pull-request':
        const { 
          owner: prOwner, 
          repo: prRepo, 
          title, 
          body, 
          head, 
          base = 'main' 
        } = data;
        
        const { data: pr } = await octokit.pulls.create({
          owner: prOwner,
          repo: prRepo,
          title,
          body,
          head,
          base,
        });

        return NextResponse.json({
          success: true,
          pullRequest: pr,
          url: pr.html_url,
        });

      case 'create-issue':
        const { 
          owner: issueOwner, 
          repo: issueRepo, 
          title: issueTitle, 
          body: issueBody, 
          labels = [] 
        } = data;
        
        const { data: issue } = await octokit.issues.create({
          owner: issueOwner,
          repo: issueRepo,
          title: issueTitle,
          body: issueBody,
          labels,
        });

        return NextResponse.json({
          success: true,
          issue,
          url: issue.html_url,
        });

      case 'create-workflow':
        const { 
          owner: workflowOwner, 
          repo: workflowRepo, 
          workflowName, 
          workflowContent 
        } = data;
        
        const { data: workflow } = await octokit.repos.createOrUpdateFileContents({
          owner: workflowOwner,
          repo: workflowRepo,
          path: `.github/workflows/${workflowName}.yml`,
          message: `Add ${workflowName} workflow`,
          content: Buffer.from(workflowContent).toString('base64'),
          branch: 'main',
        });

        return NextResponse.json({
          success: true,
          workflow,
          message: 'CI/CD workflow created successfully',
        });

      case 'deploy-to-github-pages':
        const { 
          owner: pagesOwner, 
          repo: pagesRepo, 
          branch: pagesBranch = 'gh-pages' 
        } = data;
        
        // Create gh-pages branch if it doesn't exist
        try {
          const { data: mainRef } = await octokit.git.getRef({
            owner: pagesOwner,
            repo: pagesRepo,
            ref: 'heads/main',
          });

          await octokit.git.createRef({
            owner: pagesOwner,
            repo: pagesRepo,
            ref: `refs/heads/${pagesBranch}`,
            sha: mainRef.object.sha,
          });
        } catch (error) {
          // Branch might already exist
        }

        // Enable GitHub Pages
        await octokit.repos.createPagesSite({
          owner: pagesOwner,
          repo: pagesRepo,
          source: {
            branch: pagesBranch,
            path: '/',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'GitHub Pages deployment configured',
          url: `https://${pagesOwner}.github.io/${pagesRepo}`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'GitHub operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!octokit) {
      return NextResponse.json(
        { error: 'GitHub is not configured. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get-repositories':
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 30,
        });

        return NextResponse.json({
          success: true,
          repositories: repos,
        });

      case 'get-repository':
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');
        
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo required' },
            { status: 400 }
          );
        }

        const { data: repository } = await octokit.repos.get({
          owner,
          repo,
        });

        return NextResponse.json({
          success: true,
          repository,
        });

      case 'get-branches':
        const branchOwner = searchParams.get('owner');
        const branchRepo = searchParams.get('repo');
        
        if (!branchOwner || !branchRepo) {
          return NextResponse.json(
            { error: 'Owner and repo required' },
            { status: 400 }
          );
        }

        const { data: branches } = await octokit.repos.listBranches({
          owner: branchOwner,
          repo: branchRepo,
        });

        return NextResponse.json({
          success: true,
          branches,
        });

      case 'get-commits':
        const commitOwner = searchParams.get('owner');
        const commitRepo = searchParams.get('repo');
        const branch = searchParams.get('branch') || 'main';
        
        if (!commitOwner || !commitRepo) {
          return NextResponse.json(
            { error: 'Owner and repo required' },
            { status: 400 }
          );
        }

        const { data: commits } = await octokit.repos.listCommits({
          owner: commitOwner,
          repo: commitRepo,
          sha: branch,
          per_page: 20,
        });

        return NextResponse.json({
          success: true,
          commits,
        });

      case 'get-pull-requests':
        const prOwner = searchParams.get('owner');
        const prRepo = searchParams.get('repo');
        const state = searchParams.get('state') || 'open';
        
        if (!prOwner || !prRepo) {
          return NextResponse.json(
            { error: 'Owner and repo required' },
            { status: 400 }
          );
        }

        const { data: pullRequests } = await octokit.pulls.list({
          owner: prOwner,
          repo: prRepo,
          state: state as 'open' | 'closed' | 'all',
          per_page: 20,
        });

        return NextResponse.json({
          success: true,
          pullRequests,
        });

      case 'get-issues':
        const issueOwner = searchParams.get('owner');
        const issueRepo = searchParams.get('repo');
        const issueState = searchParams.get('state') || 'open';
        
        if (!issueOwner || !issueRepo) {
          return NextResponse.json(
            { error: 'Owner and repo required' },
            { status: 400 }
          );
        }

        const { data: issues } = await octokit.issues.listForRepo({
          owner: issueOwner,
          repo: issueRepo,
          state: issueState as 'open' | 'closed' | 'all',
          per_page: 20,
        });

        return NextResponse.json({
          success: true,
          issues,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}
