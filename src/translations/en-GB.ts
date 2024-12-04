import { Translations } from "./types";

const enGB: Translations = {
  "app.title": "Zon",
  "upload-button.label": "Select folder",
  "counting-lines.text": ({ path }) => `Counting lines in ${path}`,
  "group-name": "Smaller items",
  "breadcrumbs.label": "Breadcrumbs",
  "report-list.nav.label": ({ name }) => `${name} content list`,
  "list-item.number-of-lines": ({ numberOfLines }) => `${numberOfLines} lines`,
};

export default enGB;
