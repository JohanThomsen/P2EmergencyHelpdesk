describe('Marker test', () => {
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
    it("click marker", () => {
        cy.get("#fire0").click()
    })
    it("Create marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932731, 57.046396],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: true,
                    id: 22
        })
    })
    it("Create marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.93209, 57.046302],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: true,
                    id: 22
        })
    })
    it("Create marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932496, 57.04754],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: true,
                    id: 22
        })
    })
    it("Create marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.933083, 57.048411],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: true,
                    id: 22
        })
    })
    let address;
    it("click marker", () => {
        cy.get("#fire0").click()
        cy.wait(1000)
        cy.get("#address").then(($span) => {
            address = $span.text();
        })
    })
    it("click marker", () => {
        cy.get("#fire1").click()
        cy.wait(1000)
        cy.get("#address").should("contain", address)
    })
    it("click marker", () => {
        cy.get("#fire2").click()
        cy.wait(1000)
        cy.get("#address").should("contain", address)
    })
    it("click marker", () => {
        cy.get("#fire3").click()
        cy.wait(1000)
        cy.get("#address").should("not.contain", address)
    })
    it("click marker", () => {
        cy.get("#fire4").click()
        cy.wait(1000)
        cy.get("#address").should("not.contain", address)
    })
    it("clear fires", () => {
        cy.request('POST', 'http://127.0.0.1:3000/clearFires')
    })
})