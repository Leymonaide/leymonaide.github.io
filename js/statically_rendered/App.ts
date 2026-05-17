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

import { getMessageForLanguage, LanguageMessage } from "../shared/localization_common";
import { IRoute, Router } from "../shared/Router";
import { Navigation } from "./Navigation";
import { NavigationItem, NavigationItemDropdownItem } from "./NavigationItem";
import { PageTitle } from "../shared/PageTitle";

/**
 * The root class for variables exposed to templates.
 */
export class App
{
    /**
     * A string representing the application resource version. This is used for
     * cache control.
     */
    public readonly appResourceVersion: string = "1";

    /**
     * Denotes if the page was rendered statically or dynamically.
     * 
     * This option is currently not used.
     */
    public staticRender: boolean = false;

    /**
     * The source code for all inlined JS strings.
     */
    public readonly inlinedJs: Record<string, string>;

    /**
     * A set of navigation elements.
     */
    public readonly navigation: Navigation;

    /**
     * The currently requested route of the application.
     */
    public readonly route: IRoute;

    /**
     * The title of the page.
     */
    public pageTitle: PageTitle;

    /**
     * The base name of the page.
     */
    private _pageBaseName: string;

    /**
     * The set of translatable
     */
    private _translations: LanguageMessage;

    public constructor(
        inlinedJs: Record<string, string>,
        pageBaseName: string,
        route: IRoute,
        translations: LanguageMessage,
    )
    {

        this.inlinedJs = inlinedJs;
        this.route = route;
        this._pageBaseName = pageBaseName;
        this._translations = translations;

        try
        {
            if (route.pageTitle)
            {
                const pageTitleStr = getMessageForLanguage(
                    translations, "en", route.pageTitle
                );
                this.pageTitle = new PageTitle(pageTitleStr);
            }
            else
            {
                this.pageTitle = new PageTitle("");
            }
        }
        catch (e)
        {
            console.error("Failed to get page title: " + e);
            this.pageTitle = new PageTitle("");
        }

        this.navigation = new Navigation();
        this.navigation.insertItem(new NavigationItem(
            "sitewide_nav.home", "home", "/"
        ));
        this.navigation.insertItem(new NavigationItem(
            "sitewide_nav.projects", "projects", "/projects",
            [
                new NavigationItemDropdownItem(
                    "sitewide_nav.projects_rehike", "projects_rehike",
                    "/projects/rehike",
                ),
                new NavigationItemDropdownItem(
                    "sitewide_nav.projects_retwitter", "projects_retwitter",
                    "/projects/retwitter",
                ),
            ],
        ));
        this.navigation.insertItem(new NavigationItem(
            "sitewide_nav.blog", "blog", "/blog"
        ));
        this.navigation.insertItem(new NavigationItem(
            "sitewide_nav.friends", "friends", "/friends"
        ));

        this.navigation.selectItemFromBaseName(this._pageBaseName);
    }
}