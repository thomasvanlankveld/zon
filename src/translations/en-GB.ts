const enGBTranslations = {
  "app.title": "Zon",
  "close.action": "Close",
  "dismiss.action": "Dismiss",
  "retry.action": "Retry",
  "report.action": "Report issue",
  "landing-page.welcome-message": "Select a folder to count its lines",
  "landing-page.welcome-message.web": "Paste Tokei JSON output below",
  "show-report-button.label": "Show report",
  "upload-button.label": "Select folder",
  "counting-lines.text": "Counting lines in",
  "group-name": "Smaller items",
  "breadcrumbs.label": "Breadcrumbs",
  "report-list.nav.label": ({ name }: { name: string }) =>
    `${name} content list`,
  "report-list.number-of-lines": ({
    numberOfLines,
  }: {
    numberOfLines: string;
  }) => `${numberOfLines} lines`,
  "content.label": "Content",
  "types.label": "Types",
  "languages.label": "Languages",
  "line-type.code": "Code",
  "line-type.comments": "Comments",
  "line-type.blanks": "Blanks",
  "updater.check.in-progress": "Checking for updates...",
  "updater.check.no-updates": "You're on the latest version of Zon",
  "updater.check.error.offline":
    "To check for updates, connect to the internet",
  "updater.check.error.online": "Failed to check for updates",
  "updater.check.error.online.issue": "Update check failed",
  "updater.download.in-progress": "Downloading updates...",
  "updater.download.error.offline":
    "To download the update, connect to the internet",
  "updater.download.error.online": "Failed to download the update",
  "updater.download.error.online.issue": "Update download failed",
  "updater.download.success": "Update downloaded",
  "updater.install.in-progress": "Installing updates...",
  "updater.install.error": "Failed to install the update",
  "updater.install.error.issue": "Update installation failed",
  "updater.install.success": "Update installed",
  "updater.relaunch.in-progress": "Restarting application...",
  "updater.relaunch.error": "Failed to restart the application",
  "updater.relaunch.error.issue": "Application restart failed",
  "updater.install.action": "Install and restart",
  "updater.relaunch.action": "Restart now",
} as const;

export default enGBTranslations;
