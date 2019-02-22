class GameState {

    /*
    Description of input in class constructor 
    players = {
        player1: booleanValue, //true means it's this player's turn, false means otherwise
        player2: booleanValue
    }

    local object
    this._players = {
        player1: {
            active: booleanValue, //from players[player1]
            selectedCells: [] //empty array to hold the cells selected by the player in their turn
        },
        player2: {
            active: booleanValue, //from players[player2]
            selectedCells: [] //empty array to hold the cells selected by the player in their turn
        
        }
    }
    */
    constructor(players) {
        this._players = {};
        for (let player in players) {
            this._players[player] = {
                active: players[player],
                selectedCells: []
            }
        }
        //true means cell is available. false means it isn't
        this._cellsArr = [true, true, true, true, true, true, true, true, true];
        //game ending result (win or tie equals to a value of 'true')
        this._result = false;
    }

    play(player, cell) {
        let data = {
            error: {
                exists: null,
                message: ''
            }
        };
        /* don't trust the client with the cell id */
        if (isNaN(cell) || cell < 0 || cell > 8) {
            data.error.exists = true;
            data.error.message = 'Invalid cell id';
            return data;
        }

        if (!this._players[player].active || !this._cellsArr[cell]) {
            data.error.exists = true;
            data.error.message = !this._players[player].active ? 'Not your turn' : 'This cell is already ocupied';
            return data;
        }

        this._cellsArr[cell] = false;
        this._players[player].selectedCells.push(cell);
        this._result = this.checkResult(this._players[player].selectedCells);

        for (let p in this._players) {
            if (p === player) {
                this._players[p].active = false;
            } else {
                this._players[p].active = true;
            }
        }
        data.error.exists = false;
        data.error.message = '';
        return data;
    }

    checkResult(cells) {
        if (this._cellsArr.every(e => !e)) return true;
        if (cells.length > 2) {
            if (['0', '1', '2'].every(e => cells.includes(e)) ||
                ['3', '4', '5'].every(e => cells.includes(e)) ||
                ['6', '7', '8'].every(e => cells.includes(e)) ||
                ['0', '3', '6'].every(e => cells.includes(e)) ||
                ['1', '4', '7'].every(e => cells.includes(e)) ||
                ['2', '5', '8'].every(e => cells.includes(e)) ||
                ['0', '4', '8'].every(e => cells.includes(e)) ||
                ['6', '4', '2'].every(e => cells.includes(e))) return true;
        }
        return false;
    }

    getResult() {
        return this._result;
    }

    getActiveTurn() {
        for (let p in this._players) {
            if (this._players[p].active) return p;
        }
    }

    reset() {
        for (let p in this._players) {
            this._players[p].selectedCells = [];
        }
        for (let i = 0; i < this._cellsArr.length; i++) {
            this._cellsArr[i] = true;
        }
        this._result = false;
    }
}

module.exports = GameState;