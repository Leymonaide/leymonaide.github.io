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

import { LanguageMessage, SiteConfig } from "../interface/SiteConfig";
import loadSitewideLanguage from "./load_language";

export const APP_SUPPORTED_LANGUAGES: string[] = [
    "en",
    "ja",
    "es",
    "pt",
];

export const LANGUAGE_ALIASES: Record<string, string> = {
    "en-US": "en",
    "en-GB": "en",
};

export const DEFAULT_LANGUAGE: string = "en";

let g_sitewideLanguageLoaded: Promise<void>;
let g_isLanguageLoaded = false;

export function sitewideLanguageLoaded(): Promise<void>
{
    return g_sitewideLanguageLoaded;
}

function ensureLanguageLoaded(): void
{
    if (!g_isLanguageLoaded)
    {
        throw new Error("Requested localization before the sitewide language was loaded.");
    }
}

export function init(): void
{
    g_sitewideLanguageLoaded = new Promise(function(resolve, reject)
    {
        try
        {
            const wrappedResolver = function(value: void): void
            {
                resolve();
                g_isLanguageLoaded = true;
            }
            loadSitewideLanguage(wrappedResolver);
        }
        catch (e)
        {
            reject(e);
        }
    });
}

export function getMessage(messageId: string): string
{
    ensureLanguageLoaded();
    
    const siteConfig: SiteConfig = window["leymonaide"]["cfg_"];

    let message: string|null;
    
    if (siteConfig.MSG[siteConfig.LANGUAGE]
        && (message = getMessageForLanguage(siteConfig.LANGUAGE, messageId))
    )
    {
        return message;
    }
    else if (siteConfig.MSG[DEFAULT_LANGUAGE]
        && (message = getMessageForLanguage(DEFAULT_LANGUAGE, messageId))
    )
    {
        return message;
    }
    else
    {
        throw new Error(
            `Language message "${messageId}" does not exist in the user's ` +
            `preferred language nor the default one`
        );
    }
}

export function decorateAllElements(): void
{
    ensureLanguageLoaded();

    const elementList = Array.from(document.querySelectorAll("[data-string]"));
    for (const element of elementList)
    {
        // We always assume that we're running in a HTML environment.
        decorateElement(element as HTMLElement);
    }
}

export function decorateElement(element: HTMLElement): void
{
    ensureLanguageLoaded();
    const siteConfig: SiteConfig = window["leymonaide"]["cfg_"];

    const messageId = element.getAttribute("data-string");
    try
    {
        
        if (element.getAttribute("data-localization-applied"))
        {
            return;
        }

        const message = getMessageForLanguage(siteConfig.LANGUAGE, messageId);

        element.innerText = message;
        element.setAttribute("data-localization-applied", "true");
    }
    catch (e)
    {
        element.innerText = `[${messageId}]`;
        element.setAttribute("data-localization-failed", "true");
        console.error("Failed to apply localization to element", element, e);
    }
}

function getMessageForLanguage(languageId: string, messageId: string): string
{
    const siteConfig: SiteConfig = window["leymonaide"]["cfg_"];
    let curRoot = siteConfig.MSG[languageId];

    const messagePath = messageId.split(".");
    if (1 === messagePath.length && curRoot[messageId])
    {
        return getMessageFromRecordAtPath(languageId, curRoot, messageId);
    }
    else
    {
        const actualMessageId = messagePath.pop();
        let traversedPath = "";
        for (const part of messagePath)
        {
            traversedPath += "." + part;
            if ("object" === typeof curRoot[part])
            {
                curRoot = curRoot[part];
            }
            else
            {
                throw new Error(
                    `The record at the path "${traversedPath.substring(1)}" ` +
                    `in the message ID "${messageId}" is of type ${typeof curRoot[part]}, ` +
                    `expected object`
                );
            }
        }

        return getMessageFromRecordAtPath(languageId, curRoot, actualMessageId);
    }
}

function getMessageFromRecordAtPath(
    languageId: string,
    record: LanguageMessage,
    messageId: string,
): string
{
    if ("string" === typeof record[messageId])
    {
        return record[messageId];
    }
    else
    {
        throw new Error(
            `Message ID "${messageId}" for language "${languageId}" is of ` +
            `type ${typeof record[messageId]}, excepted string`
        );
    }
}