describe('Opplan upload test', () => {
    const longitude = 9.92012
    const latitude = 57.051885
    it("Input coordinates", () => {
        cy.visit("http://127.0.0.1:3000/uploadOP")
        cy.get('#ncoordinate').should("be.empty")
        cy.get('#ecoordinate').should("be.empty")
        cy.get('body').scrollTo('top')
        cy.get('#ncoordinate').type(latitude, {force: true})
        cy.get('#ecoordinate').type(longitude, {force: true})
        cy.wait(3500);

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

        cy.get('#fullOpPlan').attachFile("OPtest.txt");
        cy.get('#buildingOverview').attachFile("OPtest.txt");

        cy.get('#submitButton').click();
    })
    it("Test for correct OP plan", () => {
        let stringedCoord = String(longitude) + "_" + String(latitude);
        stringedCoord = stringedCoord.replace(/[.]/g,";");
        cy.request('/operativePlans=' + stringedCoord).then((data) => {
            let realPath = data.address;
            if(realPath === "gadevej 10"){
                return true
            }
        });
    }) 
})