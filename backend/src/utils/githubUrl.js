const GITHUB_URL_ERROR = 'github_url must be null or a canonical GitHub repository URL';

const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

function parseGitHubUrl(value) {
  if (value === null) return { value: null };

  if (typeof value !== 'string' || value.length > 2048 || value !== value.trim()) {
    return { error: GITHUB_URL_ERROR };
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return { error: GITHUB_URL_ERROR };
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'github.com' ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return { error: GITHUB_URL_ERROR };
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length !== 2) return { error: GITHUB_URL_ERROR };

  const [owner, repository] = segments;
  if (
    !OWNER_PATTERN.test(owner) ||
    owner.includes('--') ||
    !REPOSITORY_PATTERN.test(repository) ||
    repository === '.' ||
    repository === '..'
  ) {
    return { error: GITHUB_URL_ERROR };
  }

  const normalized = `https://github.com/${owner}/${repository}`;
  if (value !== normalized && value !== `${normalized}/`) {
    return { error: GITHUB_URL_ERROR };
  }

  return { value: normalized };
}

module.exports = {
  GITHUB_URL_ERROR,
  parseGitHubUrl,
};
