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

export class PageTitle
{
    private titleLine: string;

    public constructor(titleLine: string)
    {
        this.titleLine = titleLine;
    }

    public getTitleLine(): string
    {
        return this.titleLine;
    }

    /**
     * Gets the decorated title, including the site attribution.
     * 
     * This is intended to be used for page metadata which appears in the chrome
     * of the web browser and on search engines.
     */
    public getDecoratedTitle(): string
    {
        const title = this.getTitleLine();
        if (title == "")
        {
            return "Leymonaide";
        }
        else
        {
            return title + " - Leymonaide";
        }
    }
}