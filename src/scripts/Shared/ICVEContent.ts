export default interface ICVEContent {
  cvssVersion: string;
  cvssExplained: string;
  cvssVector: string;
  cvssLink: string;
  htmlDetails: string;
  // ParseHTML(htmlDetails: string): ICVEContent;
}
