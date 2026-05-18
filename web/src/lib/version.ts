import pkg from "../../package.json";

export const APP_VERSION = pkg.version;
export const APP_COPYRIGHT_HOLDER = pkg.author ?? "Nul Maru";
export const APP_COPYRIGHT_NOTICE = `© 2026 ${APP_COPYRIGHT_HOLDER}`;
