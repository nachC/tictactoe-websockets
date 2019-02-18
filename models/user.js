class User {
    constructor() {
        this._room = '';
        this._usedCells = [];
        this._symbol = '';
        this._username = '';
    }

    get room() {
        return this._room;
    }

    set room(r) {
        if (typeof r === 'string')
            this._room = r;
    }

    get username() {
        return this._username;
    }

    set username(username) {
        this._username = username;
    }

    get activeTurn() {
        return this._activeTurn;
    }

    set activeTurn(value) {
        if (typeof value === 'boolean')
            this._activeTurn = value;
    }

    isCellOcupied(cell) {
        for (let e of this._usedCells) {
            if (e === cell) {
                return true;
            }
        }
        return false;
    }

    set cellOcupied(cell) {
        this._usedCells.push(cell);
    }
}

module.exports = User;