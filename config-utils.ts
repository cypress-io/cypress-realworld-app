const fs = require('fs-extra')
const mysql = require('mysql')
const path = require('path')
const pdf = require('pdf-parse')
import type { Browser as PuppeteerBrowser, Page } from 'puppeteer-core'
import { retry } from '@cypress/puppeteer'
const deepmerge = require('deepmerge')

/**
 * Cleans everything under the cypress/results/reports folder at the start of the tests
 * @param reportPath: (Path of the reports folder)
 */
const cleanReports = (reportPath: string) => {
    if (fs.existsSync(reportPath)) {
        fs.rmdirSync(reportPath, { recursive: true })
    }
}

/**
 * Reads the configurations of the cypress/config/cypress_*.json files depending on envKey
 * @param envKey: ('local', 'dev', 'stage', 'prod')
 * @param config: (The cypress configuration passed by the cypress.config.ts file in setupNodeEvents)
 *
 * @return config (The updated cypress configuration depending on the environment)
 */
const getConfigByFile = (envKey: string, config: Cypress.PluginConfigOptions) => {
    let fileName = `cypress_${envKey}.json`
    console.log('---------------------------------------------------------------------------')
    console.log(`config-utils.ts :: getConfigByFile :: Config file: ${fileName}`)
    console.log('---------------------------------------------------------------------------')

    let rawData = fs.readFileSync(`cypress/config/${fileName}`)
    let newConfig = JSON.parse(rawData)

    config = deepmerge(config, newConfig)
    return config
}

/**
 * Reads a PDF file and returns its text content.
 * @param filePath - The path to the PDF file.
 * @returns A promise that resolves with the text content of the PDF file.
 */
const readPdf = (filePath: string) => {
    //@ts-ignore
    return new Promise((resolve, reject) => {
        const pdfPath = path.resolve(filePath)
        let dataBuffer = fs.readFileSync(pdfPath)

        //@ts-ignore
        pdf(dataBuffer).then(function ({ text }) {
            resolve(text)
        })
    })
}

/**
 * Retrieves the Cypress runner page from a Puppeteer browser instance.
 * Uses retry mechanism to handle cases where the page might not be immediately available.
 *
 * @param browser - The Puppeteer browser instance to search for the Cypress page
 * @returns Promise<Page> - A promise that resolves to the Cypress runner page
 * @throws Error - If the page containing 'specs/runner' cannot be found after retries
 */
const returnCypressPage = async (browser: PuppeteerBrowser) => {
    const cySpecString = 'specs/runner'
    // Utilize the retry since the page may not have opened and loaded by the time this runs
    return await retry<Promise<Page>>(async () => {
        const pages = await browser.pages()
        const page = pages.find(page => {
            return page.url().includes(cySpecString)
        })

        // If we haven't found the page, throw an error to signal that it should retry
        if (!page) throw new Error(`Could not find page matching ${cySpecString}`)

        // Otherwise, return the page instance and it will be returned by the `retry` function itself
        return page
    })
}

export default { cleanReports, getConfigByFile, readPdf, returnCypressPage }
