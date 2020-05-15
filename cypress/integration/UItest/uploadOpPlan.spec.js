describe('Opplan upload test', () => {
    const longitude = 9.932491
    const latitude = 57.04743
    it("Input coordinates", () => {
        cy.viewport(1920,3000)
        cy.visit("http://127.0.0.1:3000/uploadOP")

        cy.get('#ncoordinate').should("be.empty")
        // cy.get('body').scrollTo('top')
        cy.get('#ecoordinate').should("be.empty")
        // cy.get('body').scrollTo('top')
        cy.get('#ncoordinate').type(longitude)
        // cy.get('body').scrollTo('top')
        cy.get('#ecoordinate').type(latitude)
    })
})
