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

export default class PageManager
{
    public async loadInitialPage(): Promise<void>
    {
        await this.loadPageContainer();

        // The common template for the sitewide navigation doesn't have a
        // selected item, so the corresponding navigation item to the current
        // page must be selected now.
        try
        {
            navigation.updateNavBarSelectedItem();
        }
        catch (e)
        {
            console.error(e);
        }
        
        await this.loadPageFragmentsForUrl(window.location.pathname);

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

    public async loadPageContainer(): Promise<void>
    {
        const fragmentsDocument = await fetch("/fragment/body_container");
        const text = await fragmentsDocument.text();

        const contentElement = document.querySelector("#body-container");
        
        contentElement.innerHTML = text;

        await localization.sitewideLanguageLoaded();
        localization.decorateAllElements();
    }

    public async loadPageFragmentsForUrl(url: string): Promise<void>
    {
        const route = Router.routeUri(url);

        if (!route)
        {
            // Think about how error handling should be done here.
            return;
        }

        const fragmentsDocument = await fetch(route.fragmentsUri);
        const text = await fragmentsDocument.text();

        const contentElement = document.querySelector("#content");
        
        // CONSIDER: Using DOM parser and inserting nodes so that inserting
        // scripts just works.
        contentElement.innerHTML = text;

        await localization.sitewideLanguageLoaded();
        localization.decorateAllElements();
    }
}