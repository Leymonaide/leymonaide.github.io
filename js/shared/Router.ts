/* 
 * This file is part of Leymonaide's homepage.
 * Copyright (c) 2025 Leymonaide.
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

export interface IRoute
{
    readonly uri: string;
    readonly fragmentsUri: string;
    readonly contentTemplate: string;
    readonly pageTitle?: string;
    readonly allowWildcardMatch?: string;
}

export class Router
{
    private static readonly ROUTES: IRoute[] = [
        {
            uri: "/",
            fragmentsUri: "/fragment/index",
            contentTemplate: "index",
        },
        {
            uri: "/about",
            fragmentsUri: "/fragment/about",
            contentTemplate: "about",
            pageTitle: "page_title.about_me",
        },
        {
            uri: "/projects/index",
            fragmentsUri: "/fragment/projects",
            contentTemplate: "projects",
            pageTitle: "page_title.projects",
        },
        {
            uri: "/projects/rehike",
            fragmentsUri: "/fragment/projects_rehike",
            contentTemplate: "projects_rehike",
            pageTitle: "page_title.projects_rehike",
        },
        {
            uri: "/projects/retwitter",
            fragmentsUri: "/fragment/projects_retwitter",
            contentTemplate: "projects_retwitter",
            pageTitle: "page_title.projects_retwitter",
        },
        {
            uri: "/privacy",
            fragmentsUri: "/fragment/privacy",
            contentTemplate: "privacy",
            pageTitle: "page_title.privacy",
        },
    ];

    public static routeUri(uri: string): IRoute|null
    {
        // The Node.js server has neither "window" nor "location" APIs, so a
        // hardcoded check is necessary. The `process.env` check is substituted
        // with "false" by the client JS builder, and is subsequently removed
        // for being dead code.
        const curHost = process.env
            ? "https://leymonaide.github.io"
            : window.location.origin;

        const url = new URL(uri, curHost);
        const urlPlusIndex = new URL((uri + "/index").replace(/\/+/g, "/"), curHost);

        for (const route of this.ROUTES)
        {
            if (url.pathname == route.uri || urlPlusIndex.pathname == route.uri)
            {
                return route;
            }
        }

        return null;
    }

    public static getAllRoutes(): IRoute[]
    {
        return this.ROUTES;
    }
}