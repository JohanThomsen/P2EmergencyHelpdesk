const operator = 23;

describe('assign commander', () => {
    it("clear fires", () => {
        cy.request('POST', 'http://127.0.0.1:3000/clearFires')
        cy.wait(1000)
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
        cy.wait(1000)
    })

    it("click marker", () => {
        cy.get("#fire0").click()
        cy.wait(1000)
    })

    it("assign commander", () => {
        cy.get('.commanderdropbtn').click()
        cy.get('#Karin').click()
    })
})
describe('Check commander', () => {
    it("Should not have operative plan", () => {
        cy.visit("http://127.0.0.1:3000/commanders")
        cy.wait(1500)
        cy.get('#Generel').children().should("not.exist")
        cy.get('#Equip').children().should("not.exist")
        cy.get('#Nearby').children().should("not.exist")
    })
    it("login", () => {
        cy.get('#logInID').type(operator)
        cy.get('.logIndDiv > button').click()
    })
    it("Should have generel information", () => {
        cy.get('#Generel').children().should("exist")
    })
    it("Should firefighting equipment", () => {
        cy.get('#Equip').children().should("exist")
    })
    it("Should have nearby hazard", () => {
        cy.get('#Nearby').children().should("exist")
    }) 
    it("Should have images", () => {
        cy.get('.mySlides > .image').should("exist")
        cy.get('.buildingOverview > .image').should("exist")

    })
})
describe('uncheck commander', () => {
    it("login", () => {
        cy.visit("http://127.0.0.1:3000/commanders")
        cy.get('#logInID').type(operator)
        cy.get('.logIndDiv > button').click()
    })
    it("Resolve fire", () => {
        cy.get('#resolveButton').click()
    })
    it("Should be resolved", () => {
        cy.wait(1500)
        cy.get('#Generel').children().should("not.exist")
        cy.get('#Equip').children().should("not.exist")
        cy.get('#Nearby').children().should("not.exist")
        cy.get('#logInID').type(operator)
        cy.get('.logIndDiv > button').click()
        cy.get('.logIndDiv > #ErrorMessage').should("be.visible")
    })
})
