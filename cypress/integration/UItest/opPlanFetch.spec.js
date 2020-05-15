describe('Check nearby hazards', () => {
    it("clear fires", () => {
        cy.request('POST', 'http://127.0.0.1:3000/clearFires')
    })
    it("Create marker", () => {
        cy.visit("http://127.0.0.1:3000")
        cy.wait(1500)
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932207, 57.046674],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: true,
                    id: 22
        })
    })
    it("Should have fire info", () => {
        cy.get("#fire0").click()
        cy.get('#fireinfo').children().should("exist")
    })
    it("Should have generel information", () => {
        cy.get("#fire0").click()
        cy.get('#Generel').children().should("exist")
    })
    it("Should firefighting equipment", () => {
        cy.get("#fire0").click()
        cy.get('#Equip').children().should("exist")
    })
    it("Should have nearby hazard", () => {
        cy.get("#fire0").click()
        cy.get('#Nearby').children().should("exist")
    })
    it("Create marker", () => {
        cy.wait(1500)
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932493, 57.047372],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: true,
                    id: 22
        })
    })
    it("Should have fire info", () => {
        cy.get("#fire1").click()
        cy.get('#fireinfo').children().should("exist")
    })
    it("Should not have nearby hazard", () => {
        cy.get("#fire1").click()
        cy.get('#Nearby').children().should("not.exist")
    })
})