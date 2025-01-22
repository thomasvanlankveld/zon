const Routes = {
  Home: {
    getLocation: "/",
    Matcher: "/",
  },
  Report: {
    getLocation: (path: string) =>
      `/report?rootPath=${encodeURIComponent(path)}`,
    Matcher: "/report",
  },
};

export default Routes;
