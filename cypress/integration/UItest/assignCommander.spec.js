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
        cy.get('[onclick="assignCommander(23, [9.932207,57.046674])"]').click()
    })

    it("Go to commander page", () => {
        cy.get('.dropdown-content').invoke('show')
        cy.get('[href="/commanders"]').click()
    })

})