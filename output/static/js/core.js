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

  // js/client/load_language.ts
  function loadSitewideLanguage(signalLoaded) {
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
    const curLang = siteConfig.LANGUAGE;
    fetch("/static/i18n/" + curLang + ".json").then(async function(response) {
      siteConfig.MSG = siteConfig.MSG || {};
      siteConfig.MSG[curLang] = await response.json();
      signalLoaded();
    });
  }

  // js/client/localization.ts
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
  var g_sitewideLanguageLoaded;
  var g_isLanguageLoaded = false;
  function sitewideLanguageLoaded() {
    return g_sitewideLanguageLoaded;
  }
  function ensureLanguageLoaded() {
    if (!g_isLanguageLoaded) {
      throw new Error("Requested localization before the sitewide language was loaded.");
    }
  }
  function init() {
    g_sitewideLanguageLoaded = new Promise(function(resolve, reject) {
      try {
        const wrappedResolver = function(value) {
          resolve();
          g_isLanguageLoaded = true;
        };
        loadSitewideLanguage(wrappedResolver);
      } catch (e) {
        reject(e);
      }
    });
  }
  function decorateAllElements() {
    ensureLanguageLoaded();
    const elementList = Array.from(document.querySelectorAll("[data-string]"));
    for (const element of elementList) {
      decorateElement(element);
    }
  }
  function decorateElement(element) {
    ensureLanguageLoaded();
    const siteConfig = window["leymonaide"]["cfg_"];
    const messageId = element.getAttribute("data-string");
    try {
      if (element.getAttribute("data-localization-applied")) {
        return;
      }
      const message = getMessageForLanguage(siteConfig.LANGUAGE, messageId);
      element.innerText = message;
      element.setAttribute("data-localization-applied", "true");
    } catch (e) {
      element.innerText = `[${messageId}]`;
      element.setAttribute("data-localization-failed", "true");
      console.error("Failed to apply localization to element", element, e);
    }
  }
  function getMessageForLanguage(languageId, messageId) {
    const siteConfig = window["leymonaide"]["cfg_"];
    let curRoot = siteConfig.MSG[languageId];
    const messagePath = messageId.split(".");
    if (1 === messagePath.length && curRoot[messageId]) {
      return getMessageFromRecordAtPath(languageId, curRoot, messageId);
    } else {
      const actualMessageId = messagePath.pop();
      let traversedPath = "";
      for (const part of messagePath) {
        traversedPath += "." + part;
        if ("object" === typeof curRoot[part]) {
          curRoot = curRoot[part];
        } else {
          throw new Error(
            `The record at the path "${traversedPath.substring(1)}" in the message ID "${messageId}" is of type ${typeof curRoot[part]}, expected object`
          );
        }
      }
      return getMessageFromRecordAtPath(languageId, curRoot, actualMessageId);
    }
  }
  function getMessageFromRecordAtPath(languageId, record, messageId) {
    if ("string" === typeof record[messageId]) {
      return record[messageId];
    } else {
      throw new Error(
        `Message ID "${messageId}" for language "${languageId}" is of type ${typeof record[messageId]}, excepted string`
      );
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
      const initialLoadTime = window["leymonaide"]?.cfg_?.INITIAL_LOAD_TIME ?? null;
      if (initialLoadTime && initialLoadTime + 250 > Date.now()) {
        document.querySelector("#body-container")?.classList.add("no-transition");
      }
      document.body.classList.remove("initial-loading" /* InitialLoading */);
    }
    async loadPageContainer() {
      const fragmentsDocument = await fetch("/fragment/body_container");
      const text = await fragmentsDocument.text();
      const contentElement = document.querySelector("#body-container");
      contentElement.innerHTML = text;
      await sitewideLanguageLoaded();
      decorateAllElements();
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
      await sitewideLanguageLoaded();
      decorateAllElements();
    }
  };

  // js/client/main.ts
  (function() {
    init();
    sitewideLanguageLoaded().then(function() {
      decorateAllElements();
    });
    const g_pageManager = new PageManager();
    try {
      g_pageManager.loadInitialPage();
    } catch (e) {
      document.body.textContent = e;
    }
  })();
})();
