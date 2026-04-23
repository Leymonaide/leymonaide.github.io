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

import { Router } from "../shared/Router";

export default class PageManager
{
    public async loadInitialPage(): Promise<void>
    {
        await this.loadPageFragmentsForUrl(window.location.pathname);
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
    }
}