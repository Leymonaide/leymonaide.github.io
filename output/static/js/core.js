(() => {
  // js/shared/Router.ts
  var Router = class {
    static ROUTES = [
      {
        uri: "/",
        fragmentsUri: "/fragment/index",
        contentTemplate: "index"
      },
      {
        uri: "/about",
        fragmentsUri: "/fragment/about",
        contentTemplate: "about"
      }
    ];
    static routeUri(uri) {
      for (const route of this.ROUTES) {
        if (uri == route.uri) {
          return route;
        }
      }
      return null;
    }
    static getAllRoutes() {
      return this.ROUTES;
    }
  };

  // js/client/PageManager.ts
  var PageManager = class {
    async loadInitialPage() {
      await this.loadPageFragmentsForUrl(window.location.pathname);
    }
    async loadPageFragmentsForUrl(url) {
      const route = Router.routeUri(url);
      if (!route) {
        return;
      }
      const fragmentsDocument = await fetch(route.fragmentsUri);
      const text = await fragmentsDocument.text();
      const contentElement = document.querySelector("#content");
      contentElement.innerHTML = text;
    }
  };

  // js/client/main.ts
  (function() {
    const g_pageManager = new PageManager();
    g_pageManager.loadInitialPage();
  })();
})();
