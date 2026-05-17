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

// This file implements common functionality for the localization system, shared
// between both the client and server.

export type LanguageMessage = {
    [key: string]: string|LanguageMessage;
};

export const APP_SUPPORTED_LANGUAGES: string[] = [
    "en",
    "ja",
    "es",
    "pt",
];

export const LANGUAGE_ALIASES: Record<string, string> = {
    "en-US": "en",
    "en-GB": "en",
};

export const DEFAULT_LANGUAGE: string = "en";

export function getMessageForLanguage(
    messagesSet: LanguageMessage,
    languageId: string,
    messageId: string,
): string
{
    let curRoot = messagesSet;

    const messagePath = messageId.split(".");
    if (1 === messagePath.length && curRoot[messageId])
    {
        return getMessageFromRecordAtPath(languageId, curRoot, messageId);
    }
    else
    {
        const actualMessageId = messagePath.pop();
        let traversedPath = "";
        for (const part of messagePath)
        {
            traversedPath += "." + part;
            if ("object" === typeof curRoot[part])
            {
                curRoot = curRoot[part];
            }
            else
            {
                throw new Error(
                    `The record at the path "${traversedPath.substring(1)}" ` +
                    `in the message ID "${messageId}" is of type ${typeof curRoot[part]}, ` +
                    `expected object`
                );
            }
        }

        return getMessageFromRecordAtPath(languageId, curRoot, actualMessageId);
    }
}

export function getMessageFromRecordAtPath(
    languageId: string,
    record: LanguageMessage|string,
    messageId: string,
): string
{
    if ("string" === typeof record[messageId])
    {
        return record[messageId];
    }
    else
    {
        throw new Error(
            `Message ID "${messageId}" for language "${languageId}" is of ` +
            `type ${typeof record[messageId]}, excepted string`
        );
    }
}