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

interface IRoute
{
    readonly uri: string;
    readonly fragmentsUri: string;
    readonly contentTemplate: string;
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
        },
    ];

    public static routeUri(uri: string): IRoute|null
    {
        for (const route of this.ROUTES)
        {
            // TODO: Support for wildcard matching.
            if (uri.startsWith(route.uri))
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