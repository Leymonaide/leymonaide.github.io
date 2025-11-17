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
    // TODO: Check for cookie.

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)"))
    {
        document.body.classList.add(BodyClasses.DarkTheme);
    }
})();