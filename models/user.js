class User {
    constructor() {
        this._room = '';
        this._activeTurn = false;
        this._usedCells = [];
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