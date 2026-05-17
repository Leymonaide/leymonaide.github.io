/* 
 * This file is part of Leymonaide's homepage.
 * Copyright (c) 2026 Leymonaide.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { BodyClasses } from "../interface/BodyClasses";
import { Router } from "../shared/Router";
import * as navigation from "./navigation";
import * as localization from "./localization";
import * as eventManager from "./event_manager";

const g_pageCache: Record<string, string> = {};

export function init(): void
{
    eventManager.addEvent(window, "popstate", onPopState);
}

function onPopState(e: PopStateEvent): void
{
    navigateToPage(window.location.pathname, null, true);
}

export async function loadInitialPage(): Promise<void>
{
    await loadPageContainer();

    // The common template for the sitewide navigation doesn't have a
    // selected item, so the corresponding navigation item to the current
    // page must be selected now.
    navigation.updateNavBarSelectedItem();
    
    await loadPageFragmentsForUrl(window.location.pathname);

    // Remove the initial loading class. If more than 250 milliseconds have
    // ellapsed since the page started loading, then a transition animation
    // from the loading screen will be presented to the user. Otherwise, the
    // transition will be disabled.
    const initialLoadTime: number|null =
        window["leymonaide"]?.cfg_?.INITIAL_LOAD_TIME ?? null;
    if (initialLoadTime && initialLoadTime + 250 > Date.now())
    {
        document.querySelector("#body-container")
            ?.classList.add("no-transition");
    }
    document.body.classList.remove(BodyClasses.InitialLoading);
}

export async function loadPageContainer(): Promise<void>
{
    const fragmentsDocument = await fetch("/fragment/body_container");
    const text = await fragmentsDocument.text();

    const contentElement = document.querySelector("#body-container");
    
    contentElement.innerHTML = text;

    await localization.sitewideLanguageLoaded();
    localization.decorateAllElements();
}

export async function loadPageFragmentsForUrl(url: string): Promise<void>
{
    const route = Router.routeUri(url);

    if (!route)
    {
        throw new Error(`The requested page for URL "${url}" could not be routed`);
    }

    const text = await requestPageFragments(route.fragmentsUri);

    const contentElement = document.querySelector("#content");
    
    // CONSIDER: Using DOM parser and inserting nodes so that inserting
    // scripts just works.
    contentElement.innerHTML = text;
    decoratePageFooter();

    await localization.sitewideLanguageLoaded();
    localization.decorateAllElements();
}

export async function navigateToPage(
    url: string,
    navigationSourceElement: HTMLElement|null = null,
    noPushState: boolean = false,
): Promise<void>
{
    const route = Router.routeUri(url);

    if (!route)
    {
        // This is a bad URL, so we will navigate to it manually.
        window.location.href = url;
        return;
    }

    navigationSourceElement?.classList.add("lockup-target");
    document.body.classList.add(BodyClasses.LoadingAjax);

    try
    {
        await loadPageFragmentsForUrl(url);
        if (!noPushState)
            window.history.pushState(null, null, url);
        navigation.updateNavBarSelectedItem();

        document.body.classList.remove(BodyClasses.LoadingAjax);
        navigationSourceElement?.classList.remove("lockup-target");
    }
    catch (e)
    {
        // This is clean up for page mutations which may be preserved by the
        // browser in the case of some cold navigations. I find this is
        // particularly common when the server returns a 404 page and AJAX
        // navigation was attempted. The page will be restored with all
        // mutations kept, and the script session will be resumed rather than
        // restarted.
        document.body.classList.remove(BodyClasses.LoadingAjax);
        navigationSourceElement?.classList.remove("lockup-target");
        
        window.location.href = url;
        return;
    }
}

async function requestPageFragments(fragmentsUri: string): Promise<string>
{
    if (g_pageCache[fragmentsUri])
    {
        return g_pageCache[fragmentsUri];
    }

    const response = await fetch(fragmentsUri);
    const text = await response.text();

    g_pageCache[fragmentsUri] = text;
    return text;
}

function decoratePageFooter(): void
{
    const copyrightElement: HTMLElement =
        document.querySelector(".site-footer .copyright");

    if (copyrightElement)
    {
        const yearStr = (new Date()).getFullYear();
        copyrightElement.innerHTML = `&copy; ${yearStr} Leymonaide`;
    }
}