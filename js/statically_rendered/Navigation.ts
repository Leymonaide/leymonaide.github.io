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

import { Router } from "../shared/Router";
import { NavigationItem } from "./NavigationItem";

/**
 * Model for the navigation bar.
 */
export class Navigation
{
    private _items: NavigationItem[] = [];
    private _activeItemIndex: number = -1;

    public insertItem(item: NavigationItem): void
    {
        this._items.push(item);
    }

    public get items(): NavigationItem[]
    {
        return this._items;
    }

    public getActiveItem(): NavigationItem|null
    {
        if (-1 == this._activeItemIndex)
        {
            return null;
        }

        return this._items[this._activeItemIndex];
    }

    public selectItemFromBaseName(baseName: string): void
    {
        this._activeItemIndex = -1;
        for (let i = 0; i < this._items.length; i++)
        {
            const item = this._items[i];

            const routeResult = Router.routeUri(item.href);
            if (routeResult && routeResult.contentTemplate === baseName)
            {
                this._activeItemIndex = i;
            }
        }
    }
}