describe('Map test', () => {
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
    it("Click marker", () => {
        cy.get(".leaflet-marker-icon").click()
    })
    it("Check textbox", () => {
        cy.get("#fireinfo").children().should("exist")
        cy.get("#Generel").children().should("exist")
        cy.get("#Equip").children().should("exist")
        cy.get("#Nearby").children().should("exist")
    })
    it("Delete marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932207, 57.046674],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: false,
                    id: 22
        })
    })
    it("Click deletet marker", () => {
        cy.get(".leaflet-marker-icon").should("not.be.visible")
    })
    
})
