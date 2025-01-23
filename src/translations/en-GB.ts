import { Translations } from "./types";

const enGBTranslations: Translations = {
  "app.title": "Zon",
  "upload-button.label": "Select folder",
  "counting-lines.text": ({ path }) => `Counting lines in ${path}`,
  "group-name": "Smaller items",
  "breadcrumbs.label": "Breadcrumbs",
  "report-list.nav.label": ({ name }) => `${name} content list`,
  "report-list.number-of-lines": ({ numberOfLines }) =>
    `${numberOfLines} lines`,
  "content.label": "Content",
  "types.label": "Types",
  "languages.label": "Languages",
};

export default enGBTranslations;
