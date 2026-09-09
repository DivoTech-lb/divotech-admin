import { Octokit } from '@octokit/rest';

// GITHUB_TOKEN stays a single, server-side secret — it's DivoTech's own
// token, used to act on any client repo it has access to. Which repo it's
// allowed to touch for a given request is decided by the ownership check
// in the API routes, not by this file.
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getBusinessContent(business) {
  const { data } = await octokit.repos.getContent({
    owner: business.github_owner,
    repo: business.github_repo,
    path: business.github_file_path,
    ref: business.github_branch,
  });

  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content: JSON.parse(decoded), sha: data.sha };
}

export async function updateBusinessContent(business, newContent) {
  const { sha } = await getBusinessContent(business);

  await octokit.repos.createOrUpdateFileContents({
    owner: business.github_owner,
    repo: business.github_repo,
    path: business.github_file_path,
    branch: business.github_branch,
    message: `Update content for ${business.id} via DivoTech admin`,
    content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
    sha,
  });
}
