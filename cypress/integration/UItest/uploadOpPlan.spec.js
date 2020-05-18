describe('Opplan upload test', () => {
    const longitude = 9.932491
    const latitude = 57.04743
    it("Input coordinates", () => {
        /*cy.viewport(1920,3000)*/
        cy.visit("http://127.0.0.1:3000/uploadOP")

        cy.get('#ncoordinate').should("be.empty")
        cy.get('#ecoordinate').should("be.empty")
        cy.get('body').scrollTo('top')
        cy.get('.cypressCoord').type(longitude, {force: true})
        cy.get('#ecoordinate').type(latitude, {force: true})
       /*  cy.get('body').scrollTo(0, 1000) */
     
        /* scrollIntoView('#address') */
        cy.get('#address').type("gadevej 10", {force: true})
        cy.get('#buildingDefinition').type("Bolig", {force: true})
        cy.get('#usage').type("Bolig", {force: true})
        cy.get('#height').type("5", {force: true})
        cy.get('#specialConsiderations').type("oily", {force: true})

        cy.get('#risers').click()
        cy.get('#internalAlert').click()
        cy.get('#consideration').type("Oil tanks")

        cy.get('#fullOpPlan').invoke('removeAttr', 'required')
        cy.get('#buildingOverview').invoke('removeAttr', 'required')
    })
})