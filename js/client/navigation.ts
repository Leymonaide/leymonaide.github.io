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

export function clearNavBarSelectedItems(): void
{
    const navItemsContainer = document.querySelector("#sitewide-nav ul");

    for (let i = 0; i < navItemsContainer.children.length; i++)
    {
        const element = navItemsContainer.children[i];
        element.classList.remove("active");
    }
}

export function updateNavBarSelectedItem(): void
{
    const curRoute = Router.routeUri(window.location.pathname);
    const navItemsContainer = document.querySelector("#sitewide-nav ul");

    clearNavBarSelectedItems();

    for (let i = 0; i < navItemsContainer.children.length; i++)
    {
        const itemContainerElement = navItemsContainer.children[i];
        const itemLink = itemContainerElement.querySelector("a");
        if (itemLink)
        {
            // XXX: The paths must be relative. They must not be prepended with
            // the hostname, or the router will fail to route the URL.
            const linkRoute = Router.routeUri((new URL(itemLink.href)).pathname);
            if (linkRoute && linkRoute.contentTemplate === curRoute.contentTemplate)
            {
                itemContainerElement.classList.add("active");
            }
        }
    }
}