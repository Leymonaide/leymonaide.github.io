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

import { Navigation } from "./Navigation";
import { NavigationItem } from "./NavigationItem";
import { PageTitle } from "./PageTitle";

/**
 * The root class for variables exposed to templates.
 */
export class App
{
    /**
     * The source code for all inlined JS strings.
     */
    public readonly inlinedJs: Record<string, string>;

    /**
     * A set of navigation elements.
     */
    public readonly navigation: Navigation;

    /**
     * The title of the page.
     */
    public pageTitle: PageTitle;

    /**
     * The base name of the page.
     */
    private _pageBaseName: string;

    public constructor(inlinedJs: Record<string, string>, pageBaseName: string)
    {
        this._pageBaseName = pageBaseName;
        this.pageTitle = new PageTitle("");
        this.inlinedJs = inlinedJs;

        this.navigation = new Navigation();
        this.navigation.insertItem(new NavigationItem("Home", "home", "/"));
        this.navigation.insertItem(new NavigationItem("Another tab", "another-tab", "/abc"));
        this.navigation.insertItem(new NavigationItem("Yet another tab", "yet-another-tab", "/def"));

        this.navigation.selectItemFromBaseName(this._pageBaseName);
    }
}