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

interface MenuWidget extends HTMLElement
{
    _leymonaide_parentNode?: MenuOwnerWidget;
}

interface MenuOwnerWidget extends HTMLElement
{
    _leymonaide_widgetMenu?: MenuWidget;
    _leymonaide_clickListener?: eventManager.EventWrapper;
    _leymonaide_contextMenuListener?: eventManager.EventWrapper;
}

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

function onClickDropdownMenuContainer(elm: MenuOwnerWidget, evt: Event): void
{
    // Only prevent the default if the menu isn't open. In this case, the menu
    // will be opened. Otherwise, the default action should be carried out, such
    // as anchor navigation.
    if (!isMenuActive(elm))
    {
        showMenu(elm);
        evt.stopPropagation();
        evt.preventDefault();
    }
    else
    {
        hideMenu(elm);
    }
}

function getWidgetMenu(elm: MenuOwnerWidget): MenuWidget
{
    if (null === elm)
    {
        return null;
    }

    if (elm._leymonaide_widgetMenu)
    {
        return elm._leymonaide_widgetMenu;
    }


    const menuElement = elm.querySelector(".ui-dropdown-menu");
    if (!menuElement)
    {
        throw new Error("No menu element");
    }

    elm._leymonaide_widgetMenu = menuElement as MenuWidget;
    return menuElement as MenuWidget;
}

function isMenuActive(elm: MenuOwnerWidget): boolean
{
    const menu = getWidgetMenu(elm);
    return menu.classList.contains("active");
}

function toggleMenu(elm: MenuOwnerWidget): void
{
    isMenuActive(elm)
        ? hideMenu(elm)
        : showMenu(elm);
}

function showMenu(elm: MenuOwnerWidget): void
{
    const menu = getWidgetMenu(elm);
    elm.setAttribute("aria-expanded", "true");
    elm.setAttribute("aria-activedescendant", "true");

    menu._leymonaide_parentNode = elm;

    menu.parentNode.removeChild(menu);
    const menuContainer = document.body;
    menuContainer.appendChild(menu);

    menu.style.minWidth = elm.offsetWidth - 2 + "px";

    positionMenu(elm, menu);

    menu.classList.remove("hid");
    menu.classList.add("active");
    elm.classList.add("menu-active");

    const eventHandler = maybeHideMenu.bind(this, elm);
    const clickListener = eventManager.addEvent(document, "click", eventHandler);
    const contextMenuListener = eventManager.addEvent(document, "contextmenu", eventHandler);

    elm._leymonaide_clickListener = clickListener;
    elm._leymonaide_contextMenuListener = contextMenuListener;
}

function hideMenu(elm: MenuOwnerWidget): void
{
    const menu = getWidgetMenu(elm);
    elm.setAttribute("aria-expanded", "false");
    elm.removeAttribute("aria-activedescendant");

    menu.classList.add("hid");
    menu.classList.remove("active");
    elm.classList.remove("menu-active");

    elm._leymonaide_clickListener?.remove();
    elm._leymonaide_contextMenuListener?.remove();
}

function positionMenu(menuOwner: MenuOwnerWidget, menu: MenuWidget): void
{
    let x: number = menuOwner.offsetLeft;
    let y: number = menuOwner.offsetTop + menuOwner.offsetHeight;
    
    menu.style.left = x + "px";
    menu.style.top = y + "px";
}

function maybeHideMenu(elm: MenuOwnerWidget, evt: Event): void
{
    // The event will usually be a click event where the target is a HTML
    // element.
    let target = evt.target as HTMLElement;
    let targetAnchor: HTMLElement;
    if (target.closest)
    {
        let targetMenuOwner: MenuOwnerWidget;
        if (!target.closest("a") && target.closest(".ui-dropdown-menu"))
        {
            // A descendent of the currently-opened menu was interacted with, so
            // the menu shouldn't be closed from this handler. This check is not
            // done for anchors, since clicking those will change the current
            // page and should therefore close the menu.
            return;
        }

        if (
            (targetMenuOwner = target.closest(".ui-has-dropdown-menu"))
            && getWidgetMenu(targetMenuOwner) == getWidgetMenu(elm)
        )
        {
            // An ancestor of the same menu target was interacted with, so the
            // menu shouldn't be hidden.
            return;
        }
    }

    hideMenu(elm);
}