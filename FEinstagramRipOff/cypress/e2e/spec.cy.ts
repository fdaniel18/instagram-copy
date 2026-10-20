describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:4200');
    cy.get('#username').type('demo_user');
    cy.get('#password').type('demo_pass');
    cy.get('button').click();
    cy.wait(1000);
    cy.get('.search-input').click();
    cy.get('.search-input').type('dezvoltare');
    cy.wait(1000);
    cy.get('.search-input').clear();
    cy.get('.search-type-select').select('Tag');
    cy.get('.search-input').type('arta');
    cy.wait(1000);
    cy.get('.search-input').clear();
    cy.wait(1000);
    cy.get(
      ':nth-child(1) > .post-card > .post-actions > .show-details-btn'
    ).click();
    cy.get('.upvote').click();
    cy.get('.add-comment-btn').click();
    cy.get('#comment-text').type(
      'vai ce frumos! eu zic sa te faci influencer!'
    );
    cy.get('.submit-btn').click();
    cy.wait(1000);
    cy.get('.back-btn').click();
    cy.get('.create-post-btn').click();
    cy.get('#title').type('Fac e2e testing');
    cy.get('#text').type(
      'Am facut un test de e2e cu cypress, e foarte tare! Recomand!'
    );
    cy.get('#pictureUrl').type(
      'https://cdn.pixabay.com/photo/2018/04/22/22/57/hacker-3342696_960_720.jpg'
    );
    cy.get('.tags-container > :nth-child(1)').click();
    cy.get('.submit-btn').click();
    cy.wait(1000);
    cy.get('.profile-btn').click();
    cy.get('.signout-btn').click();
  });
});
