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

  // js/client/navigation.ts
  function clearNavBarSelectedItems() {
    const navItemsContainer = document.querySelector("#sitewide-nav ul");
    for (let i = 0; i < navItemsContainer.children.length; i++) {
      const element = navItemsContainer.children[i];
      element.classList.remove("active");
    }
  }
  function updateNavBarSelectedItem() {
    const curRoute = Router.routeUri(window.location.pathname);
    const navItemsContainer = document.querySelector("#sitewide-nav ul");
    clearNavBarSelectedItems();
    for (let i = 0; i < navItemsContainer.children.length; i++) {
      const itemContainerElement = navItemsContainer.children[i];
      const itemLink = itemContainerElement.querySelector("a");
      if (itemLink) {
        const linkRoute = Router.routeUri(new URL(itemLink.href).pathname);
        if (linkRoute && linkRoute.contentTemplate === curRoute.contentTemplate) {
          itemContainerElement.classList.add("active");
        }
      }
    }
  }

  // js/client/PageManager.ts
  var PageManager = class {
    async loadInitialPage() {
      await this.loadPageContainer();
      try {
        updateNavBarSelectedItem();
      } catch (e) {
        console.error(e);
      }
      await this.loadPageFragmentsForUrl(window.location.pathname);
      document.body.classList.remove("initial-loading" /* InitialLoading */);
    }
    async loadPageContainer() {
      const fragmentsDocument = await fetch("/fragment/body_container");
      const text = await fragmentsDocument.text();
      const contentElement = document.querySelector("#body-container");
      contentElement.innerHTML = text;
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

  // js/client/load_language.ts
  var APP_SUPPORTED_LANGUAGES = [
    "en",
    "ja",
    "es",
    "pt"
  ];
  var LANGUAGE_ALIASES = {
    "en-US": "en",
    "en-GB": "en"
  };
  function loadSitewideLanguage() {
    const siteConfig = window["leymonaide"]["cfg_"];
    siteConfig.LANGUAGE = "en";
    for (let lang of navigator.languages) {
      if (Object.keys(LANGUAGE_ALIASES).includes(lang)) {
        lang = LANGUAGE_ALIASES[lang];
      }
      if (APP_SUPPORTED_LANGUAGES.includes(lang)) {
        siteConfig.LANGUAGE = lang;
      }
    }
    document.documentElement.setAttribute("lang", siteConfig.LANGUAGE);
  }

  // js/client/main.ts
  (function() {
    loadSitewideLanguage();
    const g_pageManager = new PageManager();
    try {
      g_pageManager.loadInitialPage();
    } catch (e) {
      document.body.textContent = e;
    }
  })();
})();
