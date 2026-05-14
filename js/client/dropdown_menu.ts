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

import * as eventManager from "./event_manager";

export function init()
{
    eventManager.addDelegatedEvent(
        "click",
        "ui-has-dropdown-menu",
        onClickDropdownMenuContainer,
        
        // The navigation AJAX handler rests on the document object, aka the
        // <html> root node. In order to block the navigation events of anchors
        // underneath elements with dropdown menus, the event delegate needs to
        // rest below that, so we specify document.body (the <body> element) to
        // be our delegate host.
        document.body,
    );
}

function onClickDropdownMenuContainer(elm: HTMLElement, e: Event): void
{
    // Only prevent the default if the menu isn't open. In this case, the menu
    // will be opened. Otherwise, the default action should be carried out, such
    // as anchor navigation.
    e.stopPropagation();
    e.preventDefault();
}