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

import gulp, { TaskFunction, TaskFunctionCallback } from "gulp";
import gulp_ts from "gulp-typescript";
import gulp_uglify from "gulp-uglify";
import { VinylFile } from "gulp-typescript/release/types";
import { pipeline } from "readable-stream";
import * as through2 from "through2";
import { PageBuilder } from "./js/build/build_page.ts";
import * as fs from "fs/promises";

/**
 * Determines if this is a fast build.
 * 
 * A fast build caches certain build artifacts. It should not be used for GitHub
 * Actions builds, where the build environment is unique per each build.
 */
let g_fastBuild: boolean = true;

/**
 * A map of inlined JS file names to their minified code.
 */
const g_inlineJs: Record<string, string> = {};

function buildInlineJs(): NodeJS.WritableStream
{
    return pipeline(
        gulp.src("js/inline/*.ts"),
        through2.obj(async function (
            file: VinylFile,
            encoding: BufferEncoding,
            callback: through2.TransformCallback,
        )
        {
            try
            {
                const basename = file.basename.replace(".ts", ".js");
                let cacheFile = await fs.stat(`cache/inline_js/${basename}`);
                let originalFile = await fs.stat(file.path);
                
                // Recompile.
                if (originalFile.mtime > cacheFile.mtime)
                {
                    this.push(file);
                    return;
                }
                
                const fh = await fs.open(`cache/inline_js/${basename}`);
                const scriptName = file.basename.split(".")[0];
                g_inlineJs[scriptName] = await fh.readFile({encoding: "utf8"});

                // The file is not pushed intentionally. It is read from cache.
            }
            catch (e)
            {
                // Ignore and recompile.
                this.push(file);
            }
            finally
            {
                callback();
            }
        }),
        gulp_ts({
            rootDir: process.cwd(),
            module: "es2015",
            moduleResolution: "node",
        }),
        gulp_uglify(),
        through2.obj(async function(file: VinylFile, encoding: BufferEncoding,
            callback: through2.TransformCallback)
        {
            if (null === file.contents)
            {
                callback(new Error("File does not have contents."));
            }

            // Write cache files:
            await fs.mkdir("cache/inline_js", { recursive: true });
            let fh = await fs.open(`cache/inline_js/${file.basename}`, "w");
            fh.writeFile(file.contents!.toString());

            const scriptName = file.basename.split(".")[0];
            g_inlineJs[scriptName] = file.contents!.toString();

            this.push(file);
            callback();
        }),
    )
}

async function buildPages(): Promise<void>
{
    const pageBuilder = new PageBuilder(g_inlineJs);
    await pageBuilder.buildPages();
}

export function slow(): TaskFunction
{
    g_fastBuild = false;
    return build();
}

export function build(): TaskFunction
{
    return gulp.series(
        // Inline JS must be built before pages.
        buildInlineJs,
        buildPages,
    );
}

export default build();