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

export function get(name: string): string|undefined
{
    const cookies = document.cookie ? document.cookie.split(/\s*;\s*/) : [];
    const jar = {};

    for (let cookie of cookies)
    {
        const parts = cookie.split("=");
        const value = parts.slice(1).join("=");

        try
        {
            const parsedName = decodeURIComponent(parts[0]);

            if (!(parsedName in jar))
            {
                jar[parsedName] = decodeURIComponent(parts[1]);
            }
            
            if (name === parsedName)
            {
                break;
            }
        }
        catch
        {
            // Ignore exceptions.
        }
    }

    return jar[name] ?? undefined;
}

export function set(name: string, value: string, maxAge: number = -1): void
{
    if (!isValidName(name))
    {
        throw new Error("Invalid cookie name: " + name);
    }
    if (!isValidValue(value))
    {
        throw new Error("Invalid cookie value: " + value);
    }

    let expiresStr = "";
    if (0 == maxAge)
    {
        expiresStr = ";expires=" + (new Date(1970, 1, 1)).toUTCString();
    }
    else if (maxAge > 0)
    {
        expiresStr = ";expires=" + (new Date(Date.now() + 1000 * maxAge)).toUTCString();
    }

    let cookieStr = name + "=" + value + expiresStr;
    document.cookie = cookieStr;
}

export function remove(name: string): void
{
    set(name, "", 0);
}

function isValidName(name: string): boolean
{
    return !/[;=\s]/.test(name);
}

function isValidValue(value: string): boolean
{
    return !/[;\r\n]/.test(value);
}