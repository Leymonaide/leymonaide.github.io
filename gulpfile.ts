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
import gulpSassBuilder from "gulp-sass";
import dartSassCompiler from "sass";
import { ProcessCss } from "./js/build/process_css.ts";
import gulp_esbuild from "gulp-esbuild";
import { Transform } from "stream";

const gulpSassInstance = gulpSassBuilder(dartSassCompiler);

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

class CacheManager
{
    public static readFromCache(
        category: string,
        transformFileNameCb: (str:string) => string|null = null,
        onSuccessfulCacheReadCb: (file:VinylFile, fh:fs.FileHandle) => Promise<void>|null = null,
    ): Transform
    {
        return through2.obj(async function (
            file: VinylFile,
            encoding: BufferEncoding,
            callback: through2.TransformCallback,
        )
        {
            if (!g_fastBuild)
            {
                this.push(file);
                callback();
                return;
            }

            try
            {
                let cacheFileName = transformFileNameCb
                    ? transformFileNameCb(file.basename)
                    : file.basename;
                console.error(`Attempting to read file "${file.basename}" using transformed file name "${cacheFileName}" from cache.`);

                let cacheFile = await fs.stat(`cache/${category}/${cacheFileName}`);
                let originalFile = await fs.stat(file.path);
                
                // Recompile.
                if (originalFile.mtime > cacheFile.mtime)
                {
                    console.error("The last modified time changed. Cache invalidated.");
                    this.push(file);
                    return;
                }
                
                const fh = await fs.open(`cache/${category}/${cacheFileName}`);
                try
                {
                    if (onSuccessfulCacheReadCb)
                    {
                        await onSuccessfulCacheReadCb(file, fh);
                    }
                }
                finally
                {
                    fh.close();
                }

                // The file is not pushed intentionally. It is read from cache.
                console.error("Reading file from cache.");
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
        });
    }

    public static writeToCache(
        category: string,
        onSuccessfulCacheWriteCb: (file:VinylFile, fh:fs.FileHandle) => Promise<void>|null = null,
    ): Transform
    {
        return through2.obj(async function(file: VinylFile, encoding: BufferEncoding,
            callback: through2.TransformCallback)
        {
            console.error(`Attempting to write file "${file.basename}" to cache.`);
            if (null === file.contents)
            {
                callback(new Error("File does not have contents."));
            }

            // Write cache files:
            await fs.mkdir(`cache/${category}`, { recursive: true });
            let fh = await fs.open(`cache/${category}/${file.basename}`, "w");
            fh.writeFile(file.contents!.toString());

            try
            {
                if (onSuccessfulCacheWriteCb)
                {
                    onSuccessfulCacheWriteCb(file, fh);
                }
            }
            finally
            {
                fh.close();
            }

            this.push(file);
            callback();
        });
    }
}

function buildInlineJs(): NodeJS.WritableStream
{
    return pipeline(
        gulp.src("js/inline/*.ts"),
        CacheManager.readFromCache(
            "inline_js",
            (s) => s.replace(".ts", ".js"),
            async (file, fh) => {
                const scriptName = file.basename.split(".")[0];
                g_inlineJs[scriptName] = await fh.readFile({encoding: "utf8"});
            },
        ),
        gulp_ts({
            rootDir: process.cwd(),
            module: "es2015",
            moduleResolution: "node",
        }),
        gulp_uglify(),
        CacheManager.writeToCache(
            "inline_js",
            async (file, fh) => {
                const scriptName = file.basename.split(".")[0];
                g_inlineJs[scriptName] = file.contents!.toString();
            },
        ),
    )
}

function buildJsScripts(): NodeJS.WritableStream
{
    const outputBundleName = "core.js";

    return pipeline(
        gulp.src("js/client/main.ts"),
        CacheManager.readFromCache(
            "client_js",
            (s) => outputBundleName,
        ),
        gulp_ts({
            rootDir: process.cwd(),
            module: "es2015",
            moduleResolution: "node",
        }),
        gulp_esbuild({
            outfile: outputBundleName,
            bundle: true,
        }),
        CacheManager.writeToCache(
            "client_js",
        ),
        gulp.dest("output/static/js")
    );
}

function buildCss(): NodeJS.WritableStream
{
    return pipeline(
        gulp.src("css/*.scss"),
        through2.obj(async function (
            file: VinylFile,
            encoding: BufferEncoding,
            callback: through2.TransformCallback,
        )
        {
            try
            {
                const cssProcessor = new ProcessCss(file.path, file.contents.toString());
                await cssProcessor.process();
                file.contents = Buffer.from(cssProcessor.getResult());
                this.push(file);
            }
            catch (e)
            {
                console.error("Fuck.", e);
            }
            finally
            {
                callback();
            }
        }),
        gulpSassInstance().on("error", gulpSassInstance.logError),
        gulp.dest("output/static/css")
    );
}

async function buildPages(): Promise<void>
{
    const pageBuilder = new PageBuilder(g_inlineJs);
    await pageBuilder.buildPages();
}

export function pagesTask(): TaskFunction
{
    return gulp.series(
        // Inline JS must be built before pages.
        buildInlineJs,
        buildPages,
    );
}

function cssTask(): TaskFunction
{
    return gulp.series(buildCss);
}

function jsTask(): TaskFunction
{
    return gulp.series(buildJsScripts);
}

function slowTask(): TaskFunction
{
    g_fastBuild = false;
    return build();
}

function build(): TaskFunction
{
    g_fastBuild = true;
    return gulp.parallel(
        pagesTask(),
        buildCss,
        buildJsScripts,
    );
}

export default build();
export const css = cssTask();
export const js = jsTask();
export const slow = slowTask();