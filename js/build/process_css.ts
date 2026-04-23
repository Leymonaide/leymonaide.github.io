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

import * as path from "path";
import * as fs from "fs/promises";
import * as svgo from "svgo";

export class ProcessCss
{
    private fileName: string;
    private contents: string;

    public constructor(fileName: string, contents: string)
    {
        this.fileName = fileName;
        this.contents = contents;
    }

    public async process(): Promise<void>
    {
        await this.substituteAllInlinedSvgs();
    }

    public getResult(): string
    {
        return this.contents;
    }

    private async substituteAllInlinedSvgs()
    {
        const inlineSvgRequests = Array.from(this.contents.matchAll(/embed-svg\s*\(["|']?(.*?)["|']?\)/g));

        for (let i = inlineSvgRequests.length - 1; i >= 0; i--)
        {
            const request = inlineSvgRequests[i];
            const svgPath = path.join(path.dirname(this.fileName), request[1]);
            
            await this.substituteInlinedSvg(request[0], svgPath);
        }
    }

    private async substituteInlinedSvg(sourceText: string, svgPath: string)
    {
        const fh: fs.FileHandle = await fs.open(svgPath, "r");

        const fileContents: string = await fh.readFile("utf-8");

        const minifiedSvg = svgo.optimize(fileContents, {
            multipass: true
        }).data;

        const urlEncoded = "data:image/svg+xml," + encodeURIComponent(minifiedSvg);

        this.contents = this.contents.replace(sourceText, "url(\"" + urlEncoded + "\")");
    }
}