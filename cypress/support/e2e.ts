// @ts-check
import '@cypress/code-coverage/support'
import './commands'
import { isMobile } from './utils'

interface WindowCoverage extends Window {
    __coverage__?: any
}

beforeEach(() => {
    const apiUrl = Cypress.env('apiUrl')
    // cy.intercept middleware to remove 'if-none-match' headers from all requests
    // to prevent the server from returning cached responses of API requests
    cy.intercept({ url: `${apiUrl}/**`, middleware: true }, req => delete req.headers['if-none-match'])

    // Throttle API responses for mobile testing to simulate real world condition
    if (isMobile()) {
        cy.intercept({ url: `${apiUrl}/**`, middleware: true }, req => {
            req.on('response', res => {
                // Throttle the response to 1 Mbps to simulate a mobile 3G connection
                res.setThrottle(1000)
            })
        })
    }

    // Clean up verbose reports folder before each test if verbose failures are enabled
    if (Cypress.env('verboseFailures')) {
        cy.task('deleteFolder', 'results/screenshots')
        cy.task('deleteFolder', 'results/reports/verbose')
    }

    // Reset Backend coverage counters before each test so we get per-test coverage
    if (Cypress.env('mapNodeCoverage')) {
        const coverageUrl = Cypress.env('codeCoverage').url
        if (coverageUrl) {
            cy.request({ method: 'DELETE', url: coverageUrl, failOnStatusCode: false, log: true })
        }
    }
})

afterEach(function () {
    const specFile = Cypress.spec.relative
    const testTitle = `${this.currentTest?.title}`

    // Write verbose report for failed tests or if verbose failures are enabled
    if (this.currentTest?.state === 'failed' || Cypress.env('verboseFailures')) {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1500)
        cy.writeVerboseReport(specFile, testTitle, this.currentTest?.state ?? 'unknown', this.currentTest?.err)
    }

    cy.logger(`\n---------------------------------------------------------------------------`)
    // Frontend coverage: window.__coverage__ from the browser
    if (Cypress.env('mapCoverage') && Cypress.env('coverage')) {
        cy.window().then((win: WindowCoverage) => {
            const coverageObject = win?.__coverage__
            if (coverageObject) {
                const coverageMsg = 'e2e.ts :: afterEach :: window.__coverage__ found!'
                cy.logger(coverageMsg)
                cy.mapCoverage(specFile, testTitle, coverageObject, true)
            } else {
                const noCoverageMsg = 'e2e.ts :: afterEach :: No window.__coverage__ object found!'
                cy.logger(noCoverageMsg)
            }
        })
    }

    // Backend coverage: GET /__coverage__ from the Backend API
    if (Cypress.env('mapNodeCoverage')) {
        const coverageUrl = Cypress.env('codeCoverage').url
        if (coverageUrl) {
            cy.request({ url: coverageUrl, failOnStatusCode: false, log: true }).then(response => {
                if (response.status === 200 && response.body && Object.keys(response.body).length > 0) {
                    const coverageMsg = `e2e.ts :: afterEach :: ${coverageUrl} found!`
                    cy.logger(coverageMsg)
                    cy.mapCoverage(specFile, testTitle, response.body, false)
                } else {
                    const noCoverageMsg = `e2e.ts :: afterEach :: No ${coverageUrl} data found!`
                    cy.logger(noCoverageMsg)
                }
            })
        }
    }
})
