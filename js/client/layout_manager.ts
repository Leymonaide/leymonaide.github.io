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

import { BodyClasses } from "../interface/BodyClasses";
import * as eventManager from "./event_manager";

interface ThinLayoutMutatedElement extends HTMLElement
{
    _leymonaide_originalParentNode?: HTMLElement;
    _leymonaide_originalPreviousSibling?: HTMLElement;
}

export function init(): void
{
    eventManager.addEvent(window, "resize", onResizeWindow);
}

function onResizeWindow(e: Event): void
{
    if (shouldEnterThinLayout())
    {
        enterThinLayout();
    }
    else
    {
        exitThinLayout();
    }
}

export function getThinLayoutTransitionPoint(): number
{
    return 720;
}

export function applyThinLayoutMutations(): void
{
    if (document.body.classList.contains(BodyClasses.ThinLayout))
    {
        const mergeAfterElements: NodeListOf<ThinLayoutMutatedElement> =
            document.querySelectorAll("[data-thin-layout-merge-after]");
        
        for (const element of Array.from(mergeAfterElements))
        {
            if (element.hasAttribute("data-thin-layout-moved"))
            {
                continue;
            }

            const newPreviousSibling = document.querySelector(
                element.getAttribute("data-thin-layout-merge-after")
            );

            if (!newPreviousSibling)
            {
                console.error("Missing merge after element for ", element);
                continue;
            }

            element._leymonaide_originalParentNode =
                element.parentNode as HTMLElement;
            element._leymonaide_originalPreviousSibling =
                element.previousElementSibling as HTMLElement;
            element.setAttribute("data-thin-layout-moved", "true");

            element.parentNode.removeChild(element);
            newPreviousSibling.insertAdjacentElement("afterend", element);
        }
    }
}

function undoThinLayoutMutations(): void
{
    const movedElements: NodeListOf<ThinLayoutMutatedElement> =
        document.querySelectorAll("[data-thin-layout-moved]");
    
    for (const element of Array.from(movedElements))
    {
        if (element._leymonaide_originalPreviousSibling)
        {
            element.parentNode.removeChild(element);
            element._leymonaide_originalPreviousSibling.insertAdjacentElement(
                "afterend", element
            );
        }
        else if (element._leymonaide_originalParentNode)
        {
            element.parentNode.removeChild(element);
            element._leymonaide_originalParentNode.insertAdjacentElement(
                "afterbegin", element
            );
        }
        else
        {
            console.error(
                "Thin layout moved element has no valid parent node or previous sibling:", 
                element
            );
            continue;
        }

        element.removeAttribute("data-thin-layout-moved");
        delete element._leymonaide_originalPreviousSibling;
        delete element._leymonaide_originalParentNode;
    }
}

function shouldEnterThinLayout(): boolean
{
    return window.innerWidth < getThinLayoutTransitionPoint();
}

function enterThinLayout(): void
{
    document.body.classList.add(BodyClasses.ThinLayout);
    applyThinLayoutMutations();
}

function exitThinLayout(): void
{
    document.body.classList.remove(BodyClasses.ThinLayout);
    undoThinLayoutMutations();
}