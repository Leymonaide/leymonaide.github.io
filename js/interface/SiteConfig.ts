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

export type LanguageMessage = {
    [key: string]: string|LanguageMessage;
};

/**
 * Initial runtime configuration for the website.
 * 
 * This is currently stored in the global object `leymonaide.cfg_`.
 */
export interface SiteConfig
{
    /**
     * The current language.
     */
    LANGUAGE: string;

    /**
     * Language messages for all loaded languages.
     * 
     * The structure is a set of localized messages for each message ID, each
     * mapped to the ID of the language.
     */
    MSG: Record<string, LanguageMessage>|null;

    /**
     * The timestamp in milliseconds at the time the page was initially loaded.
     */
    INITIAL_LOAD_TIME: number;
}