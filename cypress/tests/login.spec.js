describe('login', () => { 

    it('login', () => {
        cy.visit("/")
        cy.get('#username').type("Katharina_Bernier")
        cy.get('#password').type("s3cret")
        cy.get('[data-test="signin-submit"]').click()
        
        cy.get('[data-test="sidenav-user-balance"]').should('be.visible')


    });
})
