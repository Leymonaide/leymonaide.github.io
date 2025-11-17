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
    public pageTitle: string;

    public constructor(inlinedJs: Record<string, string>)
    {
        this.inlinedJs = inlinedJs;
    }
}