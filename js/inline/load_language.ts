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

// This script figures out which language to use for the initial language of the
// document.

import { SiteConfig } from "../interface/SiteConfig";

(function() {
    const APP_SUPPORTED_LANGUAGES: string[] = [
        "en",
        "ja",
        "es",
        "pt",
    ];

    const LANGUAGE_ALIASES: Record<string, string> = {
        "en-US": "en",
        "en-GB": "en",
    };

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
})();