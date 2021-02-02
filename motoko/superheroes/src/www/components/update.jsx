import React from 'react';
import Superheroes from 'ic:canisters/superheroes';

const $ = document.getElementById.bind(document);
const idl = require('../utilities/idl');

class Update extends React.Component {

  constructor() {
    super();
    this.state = { success: null };
  }

  update(event) {
    event.preventDefault();
    const superheroId = parseInt($('update-superhero-id').value, 10);
    const name = $('update-name').value;
    const n = parseInt($('update-superpowers-count').value, 10);
    const superpowers = [];
    for (var i = 0; i < n; i++) {
      const superpower = $('update-superpower-' + i).value;
      superpowers.push(superpower);
    };
    const superhero = { name, superpowers };
    superhero.superpowers = idl.toList(superhero.superpowers);
    Superheroes.update(superheroId, superhero).then((success) => {
      this.setState({ success });
    });
  }

  toggle() {
    const n = parseInt($('update-superpowers-count').value, 10);
    const container = $('update-superpowers-container');
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild);
    };
    for (var i = 0; i < n; i++) {
      const label = document.createElement('label');
      label.setAttribute('for', 'update-superpower-' + i);
      label.innerHTML = 'Superpower #' + (i + 1) + ': ';
      container.appendChild(label);
      const input = document.createElement('input');
      input.id = 'update-superpower-' + i;
      input.type = 'text';
      container.appendChild(input);
      const br = document.createElement('br');
      container.appendChild(br);
    };
  }

  render() {
    return (
      <div>
        <h2>Update a Superhero</h2>
        <form onSubmit={ this.update.bind(this) }>
          <label for="update-superhero-id">Identifier: </label>
          <input id="update-superhero-id" type="number"/>
          <br/>
          <label for="update-name">Name: </label>
          <input id="update-name" type="text"/>
          <br/>
          <label for="update-superpowers-count">Superpowers: </label>
          <select id="update-superpowers-count" onChange={ this.toggle }>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <br/>
          <div id="update-superpowers-container"/>
          <button type="submit">Submit</button>
        </form>
        <div id="update-response">
          <pre>
            <code>{ JSON.stringify(this.state, null, 2) }</code>
          </pre>
        </div>
      </div>
    );
  }
}

export default Update;
