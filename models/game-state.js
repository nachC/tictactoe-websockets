class GameState {

    constructor(activePlayer) {
        this._activePlayer = activePlayer; // {player1: boolean, player2: boolean}
        //true means cell is available. false means it isn't
        this._cellsArr = [true, true, true, true, true, true, true, true, true];
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
        
        if (!this._activePlayer[player] || !this._cellsArr[cell]) {
            data.error.exists = true;
            data.error.message = !this._activePlayer[player] ? 'Not your turn' : 'This cell is already ocupied';
            return data;
        }

        this._cellsArr[cell] = false;
        for (let p in this._activePlayer) {
            if (p === player) {
                this._activePlayer[p] = false;
            } else {
                this._activePlayer[p] = true;
            }
        }
        data.error.exists = false;
        data.error.message = '';
        return data;
    }
}

module.exports = GameState;