class User {
    constructor() {
        this._room = '';
        this._activeTurn = false;
    }

    get room() {
        return this._room;
    }

    set room(r) {
        if (typeof r === 'string')
            this._room = r;
    }

    get activeTurn() {
        return this._activeTurn;
    }

    set activeTurn(value) {
        if (typeof value === 'boolean')
            this._activeTurn = value;
    }
}

module.exports = User;