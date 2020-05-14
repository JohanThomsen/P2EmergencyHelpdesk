describe('Map test', () => {
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
    it("Delete marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932731, 57.046396],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: false,
                    id: 22
        })
    })
    it("Delete marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.93209, 57.046302],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: false,
                    id: 22
        })
    })
    it("Delete marker", () => {
        cy.request('POST', 'http://127.0.0.1:3000/fireAlert', {
                    location: [ 9.932496, 57.04754],
                    typeFire: "big fire",
                    time: "10:45",
                    automaticAlarm: true,
                    active: false,
                    id: 22
        })
    })
    it("Create marker", () => {
        cy.visit("http://127.0.0.1:3000")
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
    let address;
    it("click marker", () => {
        cy.get("#fire0").click()
        cy.get("#address").then(($span) => {
            address = $span.text();
        })
        cy.get("#address").to.have.text(address)
        console.log(address);
    })
    it("click marker", () => {
        cy.get("#fire1").click()
        cy.get("#address").should("have.value", address)
    })
    it("click marker", () => {
        cy.get("#fire2").click()
        cy.get("#address").should("have.value", address)
    })
    it("click marker", () => {
        cy.get("#fire3").click()
        cy.get("#address").should("have.value", address)
    })
})