import { defineConfig } from 'cypress'
import fs from 'fs-extra'
import type { Browser as PuppeteerBrowser } from 'puppeteer-core'
import { setup, retry } from '@cypress/puppeteer'
import configUtils from './config-utils.js'
import codeCoverageTask from '@cypress/code-coverage/task'
import cypressSplit from 'cypress-split'
import path from 'path'
import _ from 'lodash'
import axios from 'axios'
import dotenv from 'dotenv'
import Promise from 'bluebird'
import viteConfig from './vite.cypress.config.js'
import cypressOnFix from 'cypress-on-fix'

dotenv.config({ path: ".env.local" });
dotenv.config();

let awsConfig = {
  default: undefined,
};

try {
  awsConfig = require(path.join(__dirname, "./aws-exports-es5.js"));
} catch (e) {}

export default defineConfig({
    projectId: '',
    retries: {
        runMode: 2,
    },
    e2e: {
        // @ts-ignore - morgan is not documented
        morgan: false,
        watchForFileChanges: false,
        specPattern: ['cypress/src/**/*.{spec,cy}.{js,jsx,ts,tsx}'],
        pageLoadTimeout: 90000,
        responseTimeout: 45000,
        defaultCommandTimeout: 10000,
        video: false,
        chromeWebSecurity: false,
        experimentalRunAllSpecs: true,
        experimentalStudio: true,
        screenshotsFolder: 'cypress/results/screenshots',
        videosFolder: 'cypress/results/videos',
        downloadsFolder: 'cypress/results/downloads',
        supportFile: 'cypress/support/e2e.ts',
        baseUrl: 'http://localhost:3000',
        viewportHeight: 1000,
        viewportWidth: 1280,
        env: {
            apiUrl: "http://localhost:3002",
            mobileViewportWidthBreakpoint: 414,
            coverage: false,
            codeCoverage: {
                url: 'http://localhost:3001/__coverage__',
                exclude: 'cypress/**/*.*',
            },
            TAGS: 'not @skip',
            defaultPassword: process.env.SEED_DEFAULT_USER_PASSWORD,
            paginationPageSize: process.env.PAGINATION_PAGE_SIZE,

            // Auth0
            auth0_domain: process.env.VITE_AUTH0_DOMAIN,

            // Okta
            okta_domain: process.env.VITE_OKTA_DOMAIN,
            okta_client_id: process.env.VITE_OKTA_CLIENTID,
            okta_programmatic_login: process.env.OKTA_PROGRAMMATIC_LOGIN || false,

            // Amazon Cognito
            cognito_domain: process.env.AWS_COGNITO_DOMAIN,
            cognito_programmatic_login: false,
            awsConfig: awsConfig.default,

            // Google
            googleClientId: process.env.VITE_GOOGLE_CLIENTID,

            // Coverage mapping
            mapCoverage: false,
            mapNodeCoverage: false,
            coverageMapPath: 'cypress/results/reports/coverage-map/coverage-map.json',
            nodeCoverageMapPath: 'cypress/results/reports/coverage-map/node-coverage-map.json',
            
            // Verbose failures
            verboseFailures: process.env.VERBOSE_FAILURES === 'true' || false,
        },
        setupNodeEvents,
    },
    component: {
        devServer: {
            framework: 'react',
            bundler: 'vite',
            viteConfig,
        },
        specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/component.ts',
        setupNodeEvents(on, config) {
            codeCoverageTask(on, config)
            return config
        },
    },
})

async function setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
    // Wrap 'on' to fix multiple plugin issue
    on = cypressOnFix(on)
    
    // Utilize the Puppeteer browser instance and the Puppeteer API to interact with and automate the browser
    setup({
        on,
        onMessage: {
            async waitForNetworkIdle(
                browser: any,
                timeout: number,
                retryTimeout: number,
                concurrency: number
            ) {
                // Utilize the retry since the page may not have opened and loaded by the time this runs
                const page = await configUtils.returnCypressPage(browser)
                // Cypress will maintain focus on the Cypress tab within the browser. It's generally a good idea to bring the page to the front to interact with it.
                await page.bringToFront()

                const retryMs = retryTimeout ?? config.env.networkIdleRetryTimeout
                const idleTimeout = timeout ?? config.env.networkIdleTimeout

                let timeoutId: NodeJS.Timeout | undefined

                // Create a timeout promise that resolves with null after retryMs
                const timeoutPromise = new Promise<null>(resolve => {
                    timeoutId = setTimeout(() => {
                        console.log(
                            `\ncy.puppeteer :: waitForNetworkIdle :: timeout reached after ${retryMs}ms. Network may still be active.\n`
                        )
                        resolve(null)
                    }, retryMs)
                })

                // Create the retry promise - give it more time than timeoutPromise
                const retryPromise = retry(
                    async () => {
                        await page.waitForNetworkIdle({ idleTime: idleTimeout, concurrency: concurrency })
                        return true
                    },
                    // Forcing timeoutPromise to resolve before retryPromise
                    { timeout: retryMs + idleTimeout }
                ).catch(() => {
                    // If retry fails, resolve with false instead of rejecting
                    return false
                })

                // Race between timeout and retry - whichever resolves first wins
                const result = await Promise.race([retryPromise, timeoutPromise])

                // Clean up the timeout to prevent memory leaks
                clearTimeout(timeoutId)

                return result
            },
        },
    })

    const envKey = config.env.envKey ?? 'local'
    config.env['envKey'] = envKey

    require('@cypress/grep/src/plugin')(config)

    // Once a reporter is chosen, pass the path dynamically
    configUtils.cleanReports('./cypress/results/reports')


    const testDataApiEndpoint = `${config.env.apiUrl}/testData`;

      const queryDatabase = ({ entity, query }: any, callback: any) => {
        const fetchData = async (attrs: any) => {
          const { data } = await axios.get(`${testDataApiEndpoint}/${entity}`);
          return callback(data, attrs);
        };

        return Array.isArray(query) ? Promise.map(query, fetchData) : fetchData(query);
      };

    on('task', {
        logMsg(msg) {
            console.log(msg)
            return null
        },
        readJsonMaybe(jsonPath) {
            if (fs.existsSync(jsonPath)) {
                return fs.readJson(jsonPath)
            }
            return {}
        },
        readPDF(pdfPath) {
            return configUtils.readPdf(pdfPath)
        },
        deleteFile(filePath: string) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                return null
            }
            return null
        },
        deleteFolder(folderPath: string) {
            const localPath = `cypress/${folderPath}`
            if (fs.existsSync(localPath)) {
                fs.rmSync(localPath, { recursive: true })
            }
            return null
        },
        async "db:seed"() {
          // seed database with test data
          const { data } = await axios.post(`${testDataApiEndpoint}/seed`);
          return data;
        },

        // fetch test data from a database (MySQL, PostgreSQL, etc...)
        "filter:database"(queryPayload: any) {
          return queryDatabase(queryPayload, (data: any, attrs: any) => _.filter(data.results, attrs));
        },
        "find:database"(queryPayload: any) {
          return queryDatabase(queryPayload, (data: any, attrs: any) => _.find(data.results, attrs));
        },
        getAuth0Credentials() {
          const username = process.env.AUTH0_USERNAME;
          const password = process.env.AUTH0_PASSWORD;
          if (!username || !password) {
            throw new Error("AUTH0_USERNAME and AUTH0_PASSWORD must be set");
          }
          return { username, password };
        },
        getOktaCredentials() {
          const username = process.env.OKTA_USERNAME;
          const password = process.env.OKTA_PASSWORD;
          if (!username || !password) {
            throw new Error("OKTA_USERNAME and OKTA_PASSWORD must be set");
          }
          return { username, password };
        },
        getCognitoCredentials() {
          const username = process.env.AWS_COGNITO_USERNAME;
          const password = process.env.AWS_COGNITO_PASSWORD;
          if (!username || !password) {
            throw new Error("AWS_COGNITO_USERNAME and AWS_COGNITO_PASSWORD must be set");
          }
          return { username, password };
        },
        getGoogleCredentials() {
          const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
          const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET;
          if (!refreshToken || !clientSecret) {
            throw new Error("GOOGLE_REFRESH_TOKEN and VITE_GOOGLE_CLIENT_SECRET must be set");
          }
          return { refreshToken, clientSecret };
        },
    })

    codeCoverageTask(on, config)
    cypressSplit(on, config)
    config = configUtils.getConfigByFile(envKey, config)
    return config
}
