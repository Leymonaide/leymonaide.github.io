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

import * as pageManager from "./page_manager";

export type DelegateEventPrototype = 
    ((elm:HTMLElement)=>void) | ((elm:HTMLElement,e:Event)=>void);

type EventClassHandlerSet = Record<string, Array<DelegateEventPrototype>>;
type EventHandlerRegistrationSet = Record<string, EventClassHandlerSet>

const g_delegateHandlers: EventHandlerRegistrationSet = {};
const g_activeDelegateEvents: string[] = [];

class EventWrapper
{
    public readonly target: EventTarget;
    public readonly name: string;
    public readonly cb: (e:Event) => void;

    public constructor(target: EventTarget, name: string, cb: (e:Event) => void)
    {
        this.target = target;
        this.name = name;
        this.cb = cb;
    }

    public remove(): void
    {
        removeEvent(this.target, this.name, this.cb);
    }
}

export function init(): void
{
    addEvent(document, "click", handleClickAnchorOrChild);
}

function handleClickAnchorOrChild(e: Event): void
{
    let activeElement = e.target as HTMLElement;
    
    while (null != activeElement)
    {
        let classes: string[];
        if (activeElement.classList)
        {
            classes = Array.from(activeElement.classList);
        }
        else
        {
            classes = activeElement.className.split(" ");
        }

        for (const className of classes)
        {
            if ("event-no-propagate" == className)
            {
                return;
            }
            else if ("no-ajax" == className && "A" == activeElement.tagName)
            {
                return;
            }
        }

        if ("A" == activeElement.tagName)
        {
            const anchor = activeElement as HTMLAnchorElement;
            const linkHref = new URL(anchor.href, window.location.origin);

            const isLinkRelative = linkHref.origin == window.location.origin;

            if (isLinkRelative)
            {
                // Prevent the browser from doing manual navigation.
                try
                {
                    pageManager.navigateToPage(linkHref.pathname);
                    e.preventDefault();
                }
                catch (e)
                {
                    // We won't hit the e.preventDefault() in the above scope,
                    // so the browser will handle hard navigation in the event
                    // of an error. Nothing is done here, we will leave the page.
                }
            }

            return;
        }

        activeElement = activeElement.parentElement;
    }
}

export function addEvent(target: EventTarget, name: string, cb: (e:Event) => void): EventWrapper
{
    if (target["addEventListener"])
    {
        target.addEventListener(name, cb);
    }
    else if (target["attachEvent"])
    {
        target["attachEvent"]("on" + name, cb);
    }

    return new EventWrapper(target, name, cb);
}

export function removeEvent(target: EventTarget, name: string, cb: (e:Event) => void)
{
    if (target.removeEventListener)
    {
        target.removeEventListener(name, cb);
    }
    else if (target["detachEvent"])
    {
        target["detachEvent"]("on" + name, cb);
    }
}

function isActiveEventName(name: string): boolean
{
    return g_activeDelegateEvents.includes(name);
}

export function addDelegatedEvent(
    eventName: string,
    className: string,
    cb: DelegateEventPrototype,
): number
{
    if (!isActiveEventName(eventName))
    {
        addEvent(document, eventName, getDelegateHandler(eventName));
        g_activeDelegateEvents.push(eventName);
    }

    return addDelegateHandler(eventName, className, cb);
}

export function removeDelegatedEvent(
    eventName: string,
    className: string,
    handle: number,
): void
{
    if (!g_delegateHandlers[eventName])
        return;
    if (!g_delegateHandlers[eventName][className])
        return;

    g_delegateHandlers[eventName][className].splice(handle, 1);
}

function getDelegateHandler(eventName: string): (e:Event) => void
{
    return function(e: Event): void
    {
        let activeElement = e.target as HTMLElement;
        const handlerClassNameList = g_delegateHandlers[eventName];
        
        while (null != activeElement)
        {
            if (activeElement.className)
            {
                let classes: string[];
                if (activeElement.classList)
                {
                    classes = Array.from(activeElement.classList);
                }
                else
                {
                    classes = activeElement.className.split(" ");
                }

                for (const className of classes)
                {
                    if (className in handlerClassNameList)
                    {
                        for (const cb of handlerClassNameList[className])
                        {
                            if (typeof cb == "function")
                            {
                                cb(activeElement, e);
                            }
                        }
                    }
                    else if ("event-no-propagate" == className)
                    {
                        return;
                    }
                }
            }

            activeElement = activeElement.parentElement;
        }
    };
}

function addDelegateHandler(
    eventName: string,
    className: string,
    cb: DelegateEventPrototype,
): number
{
    if (!(eventName in g_delegateHandlers))
    {
        g_delegateHandlers[eventName] = {};
    }

    if (!(className in g_delegateHandlers[eventName]))
    {
        g_delegateHandlers[eventName][className] = [];
    }

    g_delegateHandlers[eventName][className].push(cb);
    return g_delegateHandlers[eventName][className].length - 1;
}