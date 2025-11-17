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

import { Router } from "../shared/Router.ts";
import * as nunjucks from "nunjucks";
import * as fs from "fs/promises";
import * as html_minifer from "html-minifier-next";
import { App } from "../statically_rendered/App.ts";

export class PageBuilder
{
    private readonly inlineJs: Record<string, string>;

    public constructor(inlineJs: Record<string, string>)
    {
        this.inlineJs = inlineJs;
    }

    public async buildPages(): Promise<void>
    {
        const routes = Router.getAllRoutes();
        const fileWritePromises: Promise<any>[] = [];

        for (const route of routes)
        {
            let outFilePath = route.uri;

            if ("/" == outFilePath[0])
            {
                outFilePath = outFilePath.substring(1);
            }

            if ("" == outFilePath)
            {
                outFilePath = "index";
            }

            outFilePath += ".html";

            const nunjucksEnv = new nunjucks.Environment(
                new nunjucks.FileSystemLoader("html"),
                {
                    lstripBlocks: true,
                    trimBlocks: true,
                },
            );

            nunjucksEnv.addFilter("minifyCss", PageBuilder.minifyCss);

            // Ensure that the fragments folder exists in the output directory:
            await fs.mkdir("output/fragment", {
                recursive: true,
            });

            const app = new App(this.inlineJs);
            nunjucksEnv.addGlobal("app", app);

            // Write the page fragment for the page:
            {
                const result = await html_minifer.minify(nunjucksEnv.render(
                    `${route.contentTemplate}.njk`,
                ), {
                    collapseWhitespace: true,
                    removeTagWhitespace: true,
                    caseSensitive: true,
                    decodeEntities: true,
                });

                const fhPromise = fs.open(
                    `output/fragment/${outFilePath}`, "w"
                ).then(
                    (fh: fs.FileHandle) =>
                    {
                        fh.writeFile(result).then(() => {
                            fh.close();
                        });
                    }
                );
                fileWritePromises.push(fhPromise);
            }

            // Write the insertion point for the page:
            {
                const result = await html_minifer.minify(nunjucksEnv.render(
                    `base.njk`,
                ), {
                    collapseWhitespace: true,
                    removeTagWhitespace: true,
                    caseSensitive: true,
                    decodeEntities: true,
                });

                const fhPromise = fs.open(
                    `output/${outFilePath}`, "w"
                ).then(
                    (fh: fs.FileHandle) =>
                    {
                        fh.writeFile(result).then(() => {
                            fh.close();
                        });
                    }
                );
                fileWritePromises.push(fhPromise);
            }
        }

        await Promise.all(fileWritePromises);
    }

    public static minifyCss(css: string): string
    {
        return css.replace(/\n|\s/g, "");
    }
}