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

// This module handles basic loading of the theme (light/dark mode) at page
// initialization.

import { BodyClasses } from "../interface/BodyClasses";

(function(){
    const enum UserThemePreference
    {
        None,
        Light,
        Dark,
    }

    function getThemePreferenceFromCookie(): UserThemePreference
    {
        const cookies = document.cookie?.split("; ") ?? [];
        const jar: Record<string, string> = {};

        for (const cookie of cookies)
        {
            const parts = cookie.split("=");
            try
            {
                jar[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }
            catch
            {
                // Ignore exceptions.
            }
        }

        if (jar["theme"])
        {
            switch (jar["theme"].toLowerCase())
            {
                case "light":
                    return UserThemePreference.Light;
                case "dark":
                    return UserThemePreference.Dark;
            }
        }

        return UserThemePreference.None;
    }

    const userThemePreference = getThemePreferenceFromCookie();

    if (userThemePreference == UserThemePreference.Light)
    {
        // Do nothing, there is no specific class for the light theme.
    }
    else if (userThemePreference == UserThemePreference.Dark
        || window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)"))
    {
        document.body.classList.add(BodyClasses.DarkTheme);
    }

    if (window.innerWidth < 720)
    {
        document.body.classList.add(BodyClasses.ThinLayout);
    }
})();