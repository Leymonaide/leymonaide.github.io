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

export function init(): void
{
    eventManager.addEvent(window, "resize", onResizeWindow);
}

function onResizeWindow(e: Event): void
{
    if (window.innerWidth < 720)
    {
        document.body.classList.add(BodyClasses.ThinLayout);
    }
    else
    {
        document.body.classList.remove(BodyClasses.ThinLayout);
    }
}