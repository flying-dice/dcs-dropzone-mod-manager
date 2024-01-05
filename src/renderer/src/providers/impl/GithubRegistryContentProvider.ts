import { Meta, RegistryContentProvider, Release, Releases } from '../RegistryContentProvider'
import { Octokit } from 'octokit'

export class GithubRegistryContentProvider implements RegistryContentProvider {
  static octokit = new Octokit()

  private get octokitProps(): { owner: string; repo: string } {
    return {
      owner: this.owner,
      repo: this.repo
    }
  }

  constructor(
    private readonly owner: string,
    private readonly repo: string
  ) {}

  async getMeta(): Promise<Meta> {
    const response = await GithubRegistryContentProvider.octokit.rest.repos.get(this.octokitProps)

    return {
      url: response.data.html_url,
      license: response.data.license?.name,
      stars: response.data.stargazers_count,
      description: response.data.description || undefined,
      topics: response.data.topics
    }
  }

  async getReadme(): Promise<string> {
    const response = await GithubRegistryContentProvider.octokit.rest.repos.getReadme(
      this.octokitProps
    )
    return atob(response.data.content)
  }

  async getLatestRelease(): Promise<Release> {
    const response = await GithubRegistryContentProvider.octokit.rest.repos.getLatestRelease(
      this.octokitProps
    )
    return {
      htmlUrl: response.data.html_url,
      tag: response.data.tag_name,
      name: response.data.name || 'Unnamed Release',
      created: response.data.created_at,
      assets: response.data.assets.map(({ name, browser_download_url, size }) => ({
        name,
        downloadUrl: browser_download_url,
        size
      }))
    }
  }

  async getReleases(): Promise<Releases> {
    const response = await GithubRegistryContentProvider.octokit.rest.repos.listReleases(
      this.octokitProps
    )
    console.log(response.data)
    return response.data.map(({ tag_name, name, html_url, created_at, assets }) => ({
      htmlUrl: html_url,
      tag: tag_name,
      name: name || 'Unnamed Release',
      created: created_at,
      assets: assets.map(({ name, browser_download_url, size }) => ({
        name,
        downloadUrl: browser_download_url,
        size
      }))
    }))
  }

  static fromRepoUrl(repoUrl: string): GithubRegistryContentProvider {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/')
    return new GithubRegistryContentProvider(owner, repo)
  }

  static setOctokit(octokit?: Octokit): void {
    GithubRegistryContentProvider.octokit = octokit || new Octokit()
  }
}
