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
      },
      {
        uri: "/projects/index",
        fragmentsUri: "/fragment/projects",
        contentTemplate: "projects"
      },
      {
        uri: "/projects/rehike",
        fragmentsUri: "/fragment/projects_rehike",
        contentTemplate: "projects_rehike"
      },
      {
        uri: "/projects/retwitter",
        fragmentsUri: "/fragment/projects_retwitter",
        contentTemplate: "projects_retwitter"
      },
      {
        uri: "/privacy",
        fragmentsUri: "/fragment/privacy",
        contentTemplate: "privacy"
      }
    ];
    static routeUri(uri) {
      for (const route of this.ROUTES) {
        if (uri == route.uri || (uri + "/index").replace(/\/+/g, "/") == route.uri) {
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
    g_sitewideLanguageLoaded = (async function() {
      await loadSitewideLanguage();
      g_isLanguageLoaded = true;
    })();
  }
  async function loadSitewideLanguage() {
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
    const response = await fetch("/static/i18n/" + curLang + ".json");
    siteConfig.MSG = siteConfig.MSG || {};
    siteConfig.MSG[curLang] = await response.json();
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

  // js/client/event_manager.ts
  var g_delegateHandlers = {};
  var g_activeDelegateEvents = [];
  var EventWrapper = class {
    target;
    name;
    cb;
    constructor(target, name, cb) {
      this.target = target;
      this.name = name;
      this.cb = cb;
    }
    remove() {
      removeEvent(this.target, this.name, this.cb);
    }
  };
  function init2() {
    addEvent(document, "click", handleClickAnchorOrChild);
  }
  function handleClickAnchorOrChild(e) {
    let activeElement = e.target;
    while (null != activeElement) {
      let classes;
      if (activeElement.classList) {
        classes = Array.from(activeElement.classList);
      } else {
        classes = activeElement.className.split(" ");
      }
      for (const className of classes) {
        if ("event-no-propagate" == className) {
          return;
        } else if ("no-ajax" == className && "A" == activeElement.tagName) {
          return;
        }
      }
      if ("A" == activeElement.tagName) {
        const anchor = activeElement;
        const linkHref = new URL(anchor.href, window.location.origin);
        const isLinkRelative = linkHref.origin == window.location.origin;
        if (isLinkRelative) {
          let isSamePage = linkHref.pathname == window.location.pathname;
          try {
            navigateToPage(linkHref.pathname, anchor, isSamePage);
            e.preventDefault();
          } catch (e2) {
          }
        }
        return;
      }
      activeElement = activeElement.parentElement;
    }
  }
  function addEvent(target, name, cb) {
    if (target["addEventListener"]) {
      target.addEventListener(name, cb);
    } else if (target["attachEvent"]) {
      target["attachEvent"]("on" + name, cb);
    }
    return new EventWrapper(target, name, cb);
  }
  function removeEvent(target, name, cb) {
    if (target.removeEventListener) {
      target.removeEventListener(name, cb);
    } else if (target["detachEvent"]) {
      target["detachEvent"]("on" + name, cb);
    }
  }
  function isActiveEventName(name) {
    return g_activeDelegateEvents.includes(name);
  }
  function addDelegatedEvent(eventName, className, cb, delegateTarget = document) {
    if (document != delegateTarget || !isActiveEventName(eventName)) {
      addEvent(delegateTarget, eventName, getDelegateHandler(eventName));
      g_activeDelegateEvents.push(eventName);
    }
    return addDelegateHandler(eventName, className, cb);
  }
  function getDelegateHandler(eventName) {
    return function(e) {
      let activeElement = e.target;
      const handlerClassNameList = g_delegateHandlers[eventName];
      while (null != activeElement) {
        if (activeElement.className) {
          let classes;
          if (activeElement.classList) {
            classes = Array.from(activeElement.classList);
          } else {
            classes = activeElement.className.split(" ");
          }
          for (const className of classes) {
            if (className in handlerClassNameList) {
              for (const cb of handlerClassNameList[className]) {
                if (typeof cb == "function") {
                  cb(activeElement, e);
                }
              }
            } else if ("event-no-propagate" == className) {
              return;
            }
          }
        }
        activeElement = activeElement.parentElement;
      }
    };
  }
  function addDelegateHandler(eventName, className, cb) {
    if (!(eventName in g_delegateHandlers)) {
      g_delegateHandlers[eventName] = {};
    }
    if (!(className in g_delegateHandlers[eventName])) {
      g_delegateHandlers[eventName][className] = [];
    }
    g_delegateHandlers[eventName][className].push(cb);
    return g_delegateHandlers[eventName][className].length - 1;
  }

  // js/client/page_manager.ts
  var g_pageCache = {};
  function init3() {
    addEvent(window, "popstate", onPopState);
  }
  function onPopState(e) {
    navigateToPage(window.location.pathname, null, true);
  }
  async function loadInitialPage() {
    await loadPageContainer();
    updateNavBarSelectedItem();
    await loadPageFragmentsForUrl(window.location.pathname);
    const initialLoadTime = window["leymonaide"]?.cfg_?.INITIAL_LOAD_TIME ?? null;
    if (initialLoadTime && initialLoadTime + 250 > Date.now()) {
      document.querySelector("#body-container")?.classList.add("no-transition");
    }
    document.body.classList.remove("initial-loading" /* InitialLoading */);
  }
  async function loadPageContainer() {
    const fragmentsDocument = await fetch("/fragment/body_container");
    const text = await fragmentsDocument.text();
    const contentElement = document.querySelector("#body-container");
    contentElement.innerHTML = text;
    await sitewideLanguageLoaded();
    decorateAllElements();
  }
  async function loadPageFragmentsForUrl(url) {
    const route = Router.routeUri(url);
    if (!route) {
      throw new Error(`The requested page for URL "${url}" could not be routed`);
    }
    const text = await requestPageFragments(route.fragmentsUri);
    const contentElement = document.querySelector("#content");
    contentElement.innerHTML = text;
    decoratePageFooter();
    await sitewideLanguageLoaded();
    decorateAllElements();
  }
  async function navigateToPage(url, navigationSourceElement = null, noPushState = false) {
    const route = Router.routeUri(url);
    if (!route) {
      window.location.href = url;
      return;
    }
    navigationSourceElement?.classList.add("lockup-target");
    document.body.classList.add("loading-ajax" /* LoadingAjax */);
    try {
      await loadPageFragmentsForUrl(url);
      if (!noPushState)
        window.history.pushState(null, null, url);
      updateNavBarSelectedItem();
      document.body.classList.remove("loading-ajax" /* LoadingAjax */);
      navigationSourceElement?.classList.remove("lockup-target");
    } catch (e) {
      document.body.classList.remove("loading-ajax" /* LoadingAjax */);
      navigationSourceElement?.classList.remove("lockup-target");
      window.location.href = url;
      return;
    }
  }
  async function requestPageFragments(fragmentsUri) {
    if (g_pageCache[fragmentsUri]) {
      return g_pageCache[fragmentsUri];
    }
    const response = await fetch(fragmentsUri);
    const text = await response.text();
    g_pageCache[fragmentsUri] = text;
    return text;
  }
  function decoratePageFooter() {
    const copyrightElement = document.querySelector(".site-footer .copyright");
    if (copyrightElement) {
      const yearStr = (/* @__PURE__ */ new Date()).getFullYear();
      copyrightElement.innerHTML = `&copy; ${yearStr} Leymonaide`;
    }
  }

  // js/client/layout_manager.ts
  function init4() {
    addEvent(window, "resize", onResizeWindow);
  }
  function onResizeWindow(e) {
    if (window.innerWidth < 720) {
      document.body.classList.add("thin-layout" /* ThinLayout */);
    } else {
      document.body.classList.remove("thin-layout" /* ThinLayout */);
    }
  }

  // js/client/dropdown_menu.ts
  function init5() {
    addDelegatedEvent(
      "click",
      "ui-has-dropdown-menu",
      onClickDropdownMenuContainer,
      // The navigation AJAX handler rests on the document object, aka the
      // <html> root node. In order to block the navigation events of anchors
      // underneath elements with dropdown menus, the event delegate needs to
      // rest below that, so we specify document.body (the <body> element) to
      // be our delegate host.
      document.body
    );
  }
  function onClickDropdownMenuContainer(elm, evt) {
    if (!isMenuActive(elm)) {
      showMenu(elm);
      evt.stopPropagation();
      evt.preventDefault();
    } else {
      hideMenu(elm);
    }
  }
  function getWidgetMenu(elm) {
    if (null === elm) {
      return null;
    }
    if (elm._leymonaide_widgetMenu) {
      return elm._leymonaide_widgetMenu;
    }
    const menuElement = elm.querySelector(".ui-dropdown-menu");
    if (!menuElement) {
      throw new Error("No menu element");
    }
    elm._leymonaide_widgetMenu = menuElement;
    return menuElement;
  }
  function isMenuActive(elm) {
    const menu = getWidgetMenu(elm);
    return menu.classList.contains("active");
  }
  function showMenu(elm) {
    const menu = getWidgetMenu(elm);
    elm.setAttribute("aria-expanded", "true");
    elm.setAttribute("aria-activedescendant", "true");
    menu._leymonaide_parentNode = elm;
    menu.parentNode.removeChild(menu);
    const menuContainer = document.body;
    menuContainer.appendChild(menu);
    menu.style.minWidth = elm.offsetWidth - 2 + "px";
    positionMenu(elm, menu);
    menu.classList.remove("hid");
    menu.classList.add("active");
    elm.classList.add("menu-active");
    const eventHandler = maybeHideMenu.bind(this, elm);
    const clickListener = addEvent(document, "click", eventHandler);
    const contextMenuListener = addEvent(document, "contextmenu", eventHandler);
    elm._leymonaide_clickListener = clickListener;
    elm._leymonaide_contextMenuListener = contextMenuListener;
  }
  function hideMenu(elm) {
    const menu = getWidgetMenu(elm);
    elm.setAttribute("aria-expanded", "false");
    elm.removeAttribute("aria-activedescendant");
    menu.classList.add("hid");
    menu.classList.remove("active");
    elm.classList.remove("menu-active");
    elm._leymonaide_clickListener?.remove();
    elm._leymonaide_contextMenuListener?.remove();
  }
  function positionMenu(menuOwner, menu) {
    let x = menuOwner.offsetLeft;
    let y = menuOwner.offsetTop + menuOwner.offsetHeight;
    menu.style.left = x + "px";
    menu.style.top = y + "px";
  }
  function maybeHideMenu(elm, evt) {
    let target = evt.target;
    let targetAnchor;
    if (target.closest) {
      let targetMenuOwner;
      if (!target.closest("a") && target.closest(".ui-dropdown-menu")) {
        return;
      }
      if ((targetMenuOwner = target.closest(".ui-has-dropdown-menu")) && getWidgetMenu(targetMenuOwner) == getWidgetMenu(elm)) {
        return;
      }
    }
    hideMenu(elm);
  }

  // js/client/main.ts
  (function() {
    init();
    init2();
    init4();
    init3();
    init5();
    sitewideLanguageLoaded().then(function() {
      decorateAllElements();
    });
    try {
      loadInitialPage();
    } catch (e) {
      document.body.classList.add("sitewide-error");
      document.body.textContent = e;
    }
  })();
})();
