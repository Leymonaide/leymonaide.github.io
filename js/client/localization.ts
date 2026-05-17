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

// This file implements client side functionality for the localization system.

import { SiteConfig } from "../interface/SiteConfig";
import { getMessageForLanguage } from "../shared/localization_common";

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
    g_sitewideLanguageLoaded = (async function()
    {
        await loadSitewideLanguage();
        g_isLanguageLoaded = true;
    })();
}

export async function loadSitewideLanguage(): Promise<void>
{
    const siteConfig: SiteConfig = window["leymonaide"]["cfg_"];

    // The default language is English.
    siteConfig.LANGUAGE = "en";

    // TODO: Check for cookie.

    for (let lang of navigator.languages)
    {
        if (Object.keys(LANGUAGE_ALIASES).includes(lang))
        {
            lang = LANGUAGE_ALIASES[lang];
        }

        if (APP_SUPPORTED_LANGUAGES.includes(lang))
        {
            siteConfig.LANGUAGE = lang;
        }
    }

    document.documentElement.setAttribute("lang", siteConfig.LANGUAGE);

    const curLang = siteConfig.LANGUAGE;

    const response = await fetch("/static/i18n/" + curLang + ".json");
    siteConfig.MSG = siteConfig.MSG || {};
    siteConfig.MSG[curLang] = await response.json();
}

export function getMessage(messageId: string): string
{
    ensureLanguageLoaded();
    
    const siteConfig: SiteConfig = window["leymonaide"]["cfg_"];

    let message: string|null;
    
    if (siteConfig.MSG[siteConfig.LANGUAGE]
        && (message = getMessageForLanguage(
                siteConfig.MSG[siteConfig.LANGUAGE], 
                siteConfig.LANGUAGE, 
                messageId
            )
        )
    )
    {
        return message;
    }
    else if (siteConfig.MSG[DEFAULT_LANGUAGE]
        && (message = getMessageForLanguage(
                siteConfig.MSG[DEFAULT_LANGUAGE],
                DEFAULT_LANGUAGE,
                messageId
            )
        )
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

        const message = getMessageForLanguage(
            siteConfig.MSG[siteConfig.LANGUAGE],
            siteConfig.LANGUAGE,
            messageId,
        );

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