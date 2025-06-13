import { Meta, TARGET } from "../../contexts/meta";

/**
 * Creates a link to a new GitHub issue with the error details.
 *
 * Docs: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue#creating-an-issue-from-a-url-query
 *
 * @param meta - The meta object containing version and target information
 * @param error - The error object containing the error message and stack trace
 * @param issueTitle - The title of the issue to create on GitHub
 * @returns A URL for creating a new GitHub issue with the error details
 */
export default function createIssueLink(
  meta: Meta,
  error: Error,
  issueTitle: string,
) {
  const title = `[${meta.version()}]: ${issueTitle}`;
  // Not internationalized because I need to be able to read this
  const body = [
    "## Technical info",
    "",
    `- Zon version: \`${meta.version()}\``,
    // TODO: Should be a target assertion instead of a target check
    `- OS: \`${meta.target === TARGET.DESKTOP && meta.platform}\``,
    `- Error message: \`${error.message}\``,
    `- Error stack:`,
    `\`\`\`\n${error.stack}\n\`\`\``,
    "",
    "## Additional info",
    "",
    "...",
    "",
  ].join("\n");

  return `https://github.com/thomasvanlankveld/zon/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
