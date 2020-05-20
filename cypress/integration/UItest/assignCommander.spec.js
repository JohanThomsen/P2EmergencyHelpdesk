describe('Assign commander test', () => {
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
        cy.get('#Steven\\ Smith').click()
    })
    
    it("Check all commanders", () => {
        cy.request('/commanderList').then((data) => {
            let commanderList = data.body.commanders;
            const keys = Object.keys(commanderList);
            let lengthOfKey = keys.length;
            cy.get('#myDropdown').children().should('have.length', lengthOfKey)
        })
    })

    it("Go to commander page", () => {
        cy.get('.dropdown-content').invoke('show')
        cy.get('[href="/commanders"]').click()
    })
    it("clear fires", () => {
        cy.request('POST', 'http://127.0.0.1:3000/clearFires')
    })

})