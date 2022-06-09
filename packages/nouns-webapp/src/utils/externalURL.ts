export enum ExternalURL {
  discord,
  twitter,
  notion,
  discourse,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'https://discord.gg/szns';
    case ExternalURL.twitter:
      return 'https://twitter.com/sznounsdao';
    case ExternalURL.notion:
      return 'https://sznouns.notion.site/Explore-SZNouns-c084882132a34f8395f8a685e394446c';
    case ExternalURL.discourse:
      return 'https://discourse.sznouns.wtf';
  }
};
