/* 
 * This file is part of Leymonaide's homepage.
 * Copyright (c) 2025-2026 Leymonaide.
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

// This script figures out which language to use for the initial language of the
// document.

import { SiteConfig } from "../interface/SiteConfig";
import { LANGUAGE_ALIASES, APP_SUPPORTED_LANGUAGES } from "./localization";

export default function loadSitewideLanguage(signalLoaded: (value:void)=>void): void
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
    fetch("/static/i18n/" + curLang + ".json")
        .then(async function(response)
        {
            siteConfig.MSG = siteConfig.MSG || {};
            siteConfig.MSG[curLang] = await response.json();
            signalLoaded();
        });
}